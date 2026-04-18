from fastapi import APIRouter, Depends
from config import supabase
from dependencies import get_current_user, require_role
from compat import normalize_transaction_row, normalize_user_row
from schemas import DepositRequest

router = APIRouter(prefix="/wallet", tags=["Wallet"])


# ── POST /wallet/deposit (Investor) ───────────────────

@router.post("/deposit")
async def deposit(
    body: DepositRequest,
    current_user: dict = Depends(require_role("investor")),
):
    """Mock deposit: adds PKR to investor's wallet balance."""
    new_balance = current_user["wallet_balance"] + body.amount_pkr

    supabase.table("users").update({"wallet_balance": new_balance}).eq(
        "id", current_user["id"]
    ).execute()

    # Record transaction
    supabase.table("transactions").insert(
        {
            "user_id": current_user["id"],
            "type": "deposit",
            "amount_pkr": body.amount_pkr,
            "reference": "Mock deposit",
        }
    ).execute()

    return {
        "message": "Deposit successful",
        "new_balance": new_balance,
    }


# ── GET /wallet/transactions (All authenticated) ──────

@router.get("/transactions")
async def get_transactions(
    current_user: dict = Depends(get_current_user),
):
    """Get transaction history for the current user."""
    result = (
        supabase.table("transactions")
        .select("*")
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
        .execute()
    )
    return [normalize_transaction_row(row) for row in (result.data or [])]
