from fastapi import APIRouter, Depends
from config import supabase
from dependencies import get_current_user, require_role
from compat import (
    normalize_transaction_row,
    user_pk_column,
    user_id_value,
    transaction_user_column,
    created_column,
)
from schemas import DepositRequest

router = APIRouter(prefix="/wallet", tags=["Wallet"])


# ── POST /wallet/deposit (Investor) ───────────────────

@router.post("/deposit")
async def deposit(
    body: DepositRequest,
    current_user: dict = Depends(require_role("investor")),
):
    """Mock deposit: adds PKR to investor's wallet balance."""
    user_pk = user_pk_column()
    transaction_user_fk = transaction_user_column()
    current_user_id = user_id_value(current_user)
    new_balance = current_user["wallet_balance"] + body.amount_pkr

    supabase.table("users").update({"wallet_balance": new_balance}).eq(
        user_pk, current_user_id
    ).execute()

    # Record transaction
    supabase.table("transactions").insert(
        {
            transaction_user_fk: current_user_id,
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
    transaction_user_fk = transaction_user_column()
    transaction_created = created_column("transactions")
    current_user_id = user_id_value(current_user)
    result = (
        supabase.table("transactions")
        .select("*")
        .eq(transaction_user_fk, current_user_id)
        .order(transaction_created, desc=True)
        .execute()
    )
    return [normalize_transaction_row(row) for row in (result.data or [])]
