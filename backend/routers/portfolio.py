from fastapi import APIRouter, Depends
from config import supabase
from dependencies import require_role

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


# ── GET /portfolio (Investor) ─────────────────────────

@router.get("")
async def get_portfolio(
    current_user: dict = Depends(require_role("investor")),
):
    """Get all investments for the current investor, with startup info."""
    result = (
        supabase.table("investments")
        .select("*, startups!startup_id(name, tagline, sector, status)")
        .eq("investor_id", current_user["id"])
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []
