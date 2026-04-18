from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from config import supabase
from dependencies import get_current_user, require_role
from compat import (
    normalize_startup_row,
    normalize_milestone_row,
    normalize_investment_row,
    created_column,
    startup_pk_column,
    startup_founder_column,
    milestone_startup_column,
    investment_startup_column,
    investment_investor_value,
    user_id_value,
)
from schemas import (
    StartupCreate,
    StartupUpdate,
    MilestoneCreate,
    RejectReason,
)

router = APIRouter(prefix="/startups", tags=["Startups"])


# ── GET /startups (Public) ─────────────────────────────

@router.get("")
async def list_startups():
    """List all active startups with funding progress."""
    startup_created = created_column("startups")
    result = (
        supabase.table("startups")
        .select("*")
        .eq("status", "active")
        .order(startup_created, desc=True)
        .execute()
    )
    startups = result.data or []
    return [normalize_startup_row(s) for s in startups]


# ── GET /startups/mine (Founder) ───────────────────────

@router.get("/mine")
async def my_startups(
    current_user: dict = Depends(require_role("founder")),
):
    """Get the founder's own startups."""
    founder_col = startup_founder_column()
    startup_created = created_column("startups")
    current_user_id = user_id_value(current_user)
    result = (
        supabase.table("startups")
        .select("*")
        .eq(founder_col, current_user_id)
        .order(startup_created, desc=True)
        .execute()
    )
    return [normalize_startup_row(row) for row in (result.data or [])]


# ── GET /startups/pending (Admin) ──────────────────────

@router.get("/pending")
async def pending_startups(
    current_user: dict = Depends(require_role("admin")),
):
    """List all startups awaiting admin verification."""
    startup_created = created_column("startups")
    result = (
        supabase.table("startups")
        .select("*")
        .eq("status", "pending")
        .order(startup_created, desc=True)
        .execute()
    )
    return [normalize_startup_row(row) for row in (result.data or [])]


# ── GET /startups/:id (Public) ─────────────────────────

@router.get("/{startup_id}")
async def get_startup(startup_id: str):
    """Single startup detail with milestones and investor count."""
    startup_pk = startup_pk_column()
    milestone_startup_fk = milestone_startup_column()
    investment_startup_fk = investment_startup_column()

    # Fetch startup
    result = (
        supabase.table("startups")
        .select("*")
        .eq(startup_pk, startup_id)
        .maybe_single()
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Startup not found"
        )
    startup = normalize_startup_row(result.data)

    # Fetch milestones
    milestones = (
        supabase.table("milestones")
        .select("*")
        .eq(milestone_startup_fk, startup_id)
        .order("order_index")
        .execute()
    ).data or []

    # Count unique investors
    investments = (
        supabase.table("investments")
        .select("*")
        .eq(investment_startup_fk, startup_id)
        .execute()
    ).data or []
    investor_ids = {investment_investor_value(inv) for inv in investments if investment_investor_value(inv)}

    startup["milestones"] = [normalize_milestone_row(m) for m in milestones]
    startup["investor_count"] = len(investor_ids)
    startup["investors_count"] = len(investor_ids)
    return startup


# ── POST /startups (Founder) ──────────────────────────

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_startup(
    body: StartupCreate,
    current_user: dict = Depends(require_role("founder")),
):
    """Submit a new startup for admin review."""
    founder_col = startup_founder_column()
    current_user_id = user_id_value(current_user)
    result = (
        supabase.table("startups")
        .insert(
            {
                founder_col: current_user_id,
                "name": body.name,
                "tagline": body.tagline,
                "sector": body.sector.value,
                "story": body.story,
                "funding_goal": body.funding_goal,
                "amount_raised": 0,
                "equity_offered": body.equity_offered,
                "status": "pending",
                "pitch_deck_url": body.pitch_deck_url,
            }
        )
        .execute()
    )
    return normalize_startup_row(result.data[0])


# ── PUT /startups/:id (Founder) ────────────────────────

@router.put("/{startup_id}")
async def update_startup(
    startup_id: str,
    body: StartupUpdate,
    current_user: dict = Depends(require_role("founder")),
):
    """Update a draft startup before submission."""
    startup_pk = startup_pk_column()
    founder_col = startup_founder_column()
    current_user_id = user_id_value(current_user)

    # Verify ownership and draft status
    existing = (
        supabase.table("startups")
        .select("*")
        .eq(startup_pk, startup_id)
        .eq(founder_col, current_user_id)
        .maybe_single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Startup not found or not owned by you",
        )
    if existing.data["status"] not in ("draft", "pending"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only update draft or pending startups",
        )

    update_data = body.model_dump(exclude_none=True)
    if "sector" in update_data:
        update_data["sector"] = update_data["sector"].value

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    result = (
        supabase.table("startups")
        .update(update_data)
        .eq(startup_pk, startup_id)
        .execute()
    )
    return normalize_startup_row(result.data[0])


# ── POST /startups/:id/approve (Admin) ─────────────────

@router.post("/{startup_id}/approve")
async def approve_startup(
    startup_id: str,
    current_user: dict = Depends(require_role("admin")),
):
    """Admin approves a startup: status -> active."""
    startup_pk = startup_pk_column()
    existing = (
        supabase.table("startups")
        .select("status")
        .eq(startup_pk, startup_id)
        .maybe_single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Startup not found"
        )
    if existing.data["status"] != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending startups can be approved",
        )

    result = (
        supabase.table("startups")
        .update({"status": "active"})
        .eq(startup_pk, startup_id)
        .execute()
    )
    return {"message": "Startup approved", "startup": normalize_startup_row(result.data[0])}


# ── POST /startups/:id/reject (Admin) ──────────────────

@router.post("/{startup_id}/reject")
async def reject_startup(
    startup_id: str,
    body: RejectReason,
    current_user: dict = Depends(require_role("admin")),
):
    """Admin rejects a startup with a reason."""
    startup_pk = startup_pk_column()
    existing = (
        supabase.table("startups")
        .select("status")
        .eq(startup_pk, startup_id)
        .maybe_single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Startup not found"
        )

    result = (
        supabase.table("startups")
        .update({"status": "rejected"})
        .eq(startup_pk, startup_id)
        .execute()
    )
    # NOTE: The reason could be stored in a separate column or audit log.
    return {
        "message": "Startup rejected",
        "reason": body.reason,
        "startup": normalize_startup_row(result.data[0]),
    }


# ── GET /startups/:id/investors (Admin) ─────────────────

@router.get("/{startup_id}/investors")
async def list_investors(
    startup_id: str,
    current_user: dict = Depends(require_role("admin")),
):
    """List all investors in a startup."""
    investment_startup_fk = investment_startup_column()
    investment_created = created_column("investments")
    result = (
        supabase.table("investments")
        .select("*")
        .eq(investment_startup_fk, startup_id)
        .order(investment_created, desc=True)
        .execute()
    )
    return [normalize_investment_row(row) for row in (result.data or [])]


# ── GET /startups/:id/milestones (All authenticated) ───

@router.get("/{startup_id}/milestones")
async def get_milestones(startup_id: str):
    """Get milestones for a startup (public)."""
    milestone_startup_fk = milestone_startup_column()
    result = (
        supabase.table("milestones")
        .select("*")
        .eq(milestone_startup_fk, startup_id)
        .order("order_index")
        .execute()
    )
    return [normalize_milestone_row(row) for row in (result.data or [])]


# ── POST /startups/:id/milestones (Founder) ────────────

@router.post("/{startup_id}/milestones", status_code=status.HTTP_201_CREATED)
async def add_milestones(
    startup_id: str,
    milestones: List[MilestoneCreate],
    current_user: dict = Depends(require_role("founder")),
):
    """Add milestones to a startup (founder only, own startup)."""
    startup_pk = startup_pk_column()
    founder_col = startup_founder_column()
    milestone_startup_fk = milestone_startup_column()
    current_user_id = user_id_value(current_user)

    # Verify ownership
    existing = (
        supabase.table("startups")
        .select(startup_pk)
        .eq(startup_pk, startup_id)
        .eq(founder_col, current_user_id)
        .maybe_single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Startup not found or not owned by you",
        )

    rows = [
        {
            milestone_startup_fk: startup_id,
            "title": m.title,
            "description": m.description,
            "fund_percentage": m.fund_percentage,
            "status": "pending",
            "order_index": m.order_index,
        }
        for m in milestones
    ]

    result = supabase.table("milestones").insert(rows).execute()
    return [normalize_milestone_row(row) for row in (result.data or [])]
