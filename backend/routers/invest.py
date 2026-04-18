from fastapi import APIRouter, Depends, HTTPException, status
from config import supabase
from dependencies import require_role
from schemas import InvestRequest

router = APIRouter(prefix="/invest", tags=["Invest"])


# ── POST /invest/:startup_id (Investor) ───────────────

@router.post("/{startup_id}")
async def invest(
    startup_id: str,
    body: InvestRequest,
    current_user: dict = Depends(require_role("investor")),
):
    """
    Invest in a startup.
    - Checks KYC is verified
    - Checks wallet has sufficient balance
    - Calculates equity % based on (amount / funding_goal) * equity_offered
    - Deducts wallet balance
    - Records investment and transaction
    - Updates startup amount_raised
    """
    # Check KYC
    if current_user.get("kyc_status") != "verified":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="KYC must be verified before investing",
        )

    # Check wallet balance
    if current_user["wallet_balance"] < body.amount_pkr:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient wallet balance",
        )

    # Fetch startup
    startup_result = (
        supabase.table("startups")
        .select("*")
        .eq("id", startup_id)
        .eq("status", "active")
        .maybe_single()
        .execute()
    )
    if not startup_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active startup not found",
        )
    startup = startup_result.data

    # Check funding cap
    remaining = startup["funding_goal"] - startup["amount_raised"]
    if body.amount_pkr > remaining:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Investment exceeds remaining funding capacity. Max: {remaining} PKR",
        )

    # Calculate equity percentage
    equity_percent = round(
        (body.amount_pkr / startup["funding_goal"]) * startup["equity_offered"],
        4,
    )

    # Deduct wallet balance
    new_balance = current_user["wallet_balance"] - body.amount_pkr
    supabase.table("users").update({"wallet_balance": new_balance}).eq(
        "id", current_user["id"]
    ).execute()

    # Update startup amount_raised
    new_raised = startup["amount_raised"] + body.amount_pkr
    update_data = {"amount_raised": new_raised}
    if new_raised >= startup["funding_goal"]:
        update_data["status"] = "funded"

    supabase.table("startups").update(update_data).eq(
        "id", startup_id
    ).execute()

    # Record investment
    investment = (
        supabase.table("investments")
        .insert(
            {
                "investor_id": current_user["id"],
                "startup_id": startup_id,
                "amount_pkr": body.amount_pkr,
                "equity_percent": equity_percent,
            }
        )
        .execute()
    )

    # Record transaction
    supabase.table("transactions").insert(
        {
            "user_id": current_user["id"],
            "type": "investment",
            "amount_pkr": body.amount_pkr,
            "reference": f"Investment in {startup['name']}",
        }
    ).execute()

    return {
        "message": "Investment successful",
        "investment": investment.data[0],
        "new_wallet_balance": new_balance,
    }
