from fastapi import APIRouter, Depends
from config import supabase
from dependencies import require_role
from compat import (
    normalize_investment_row,
    investment_investor_column,
    investment_startup_column,
    startup_pk_column,
    created_column,
    user_id_value,
)

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


# ── GET /portfolio (Investor) ─────────────────────────

@router.get("")
async def get_portfolio(
    current_user: dict = Depends(require_role("investor")),
):
    """Get all investments for the current investor, with startup info."""
    investment_investor_fk = investment_investor_column()
    investment_startup_fk = investment_startup_column()
    startup_pk = startup_pk_column()
    investment_created = created_column("investments")
    current_user_id = user_id_value(current_user)

    result = (
        supabase.table("investments")
        .select("*")
        .eq(investment_investor_fk, current_user_id)
        .order(investment_created, desc=True)
        .execute()
    )
    rows = result.data or []

    startup_ids = [row.get(investment_startup_fk) for row in rows if row.get(investment_startup_fk)]
    startup_map = {}
    if startup_ids:
        startup_rows = (
            supabase.table("startups")
            .select("*")
            .in_(startup_pk, startup_ids)
            .execute()
        ).data or []
        startup_map = {row.get(startup_pk): row for row in startup_rows}

    hydrated_rows = []
    for row in rows:
        startup_id = row.get(investment_startup_fk)
        startup_row = startup_map.get(startup_id)
        if startup_row:
            row = {**row, "startups": startup_row}
        hydrated_rows.append(row)

    return [normalize_investment_row(row) for row in hydrated_rows]
