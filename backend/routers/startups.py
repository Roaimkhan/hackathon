from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from config import supabase
from dependencies import get_current_user, require_role
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
    result = (
        supabase.table("startups")
        .select("*")
        .eq("status", "active")
        .order("created_at", desc=True)
        .execute()
    )
    startups = result.data or []
    for s in startups:
        s["funding_progress"] = (
            round((s["amount_raised"] / s["funding_goal"]) * 100, 2)
            if s["funding_goal"] > 0
            else 0
        )
    return startups


# ── GET /startups/mine (Founder) ───────────────────────

@router.get("/mine")
async def my_startups(
    current_user: dict = Depends(require_role("founder")),
):
    """Get the founder's own startups."""
    result = (
        supabase.table("startups")
        .select("*")
        .eq("founder_id", current_user["id"])
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


# ── GET /startups/pending (Admin) ──────────────────────

@router.get("/pending")
async def pending_startups(
    current_user: dict = Depends(require_role("admin")),
):
    """List all startups awaiting admin verification."""
    result = (
        supabase.table("startups")
        .select("*")
        .eq("status", "pending")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


# ── GET /startups/:id (Public) ─────────────────────────

@router.get("/{startup_id}")
async def get_startup(startup_id: str):
    """Single startup detail with milestones and investor count."""
    # Fetch startup
    result = (
        supabase.table("startups")
        .select("*")
        .eq("id", startup_id)
        .maybe_single()
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Startup not found"
        )
    startup = result.data

    # Fetch milestones
    milestones = (
        supabase.table("milestones")
        .select("*")
        .eq("startup_id", startup_id)
        .order("order_index")
        .execute()
    ).data or []

    # Count unique investors
    investments = (
        supabase.table("investments")
        .select("investor_id")
        .eq("startup_id", startup_id)
        .execute()
    ).data or []
    investor_ids = set(inv["investor_id"] for inv in investments)

    startup["milestones"] = milestones
    startup["investor_count"] = len(investor_ids)
    startup["funding_progress"] = (
        round((startup["amount_raised"] / startup["funding_goal"]) * 100, 2)
        if startup["funding_goal"] > 0
        else 0
    )
    return startup


# ── POST /startups (Founder) ──────────────────────────

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_startup(
    body: StartupCreate,
    current_user: dict = Depends(require_role("founder")),
):
    """Submit a new startup for admin review."""
    result = (
        supabase.table("startups")
        .insert(
            {
                "founder_id": current_user["id"],
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
    return result.data[0]


# ── PUT /startups/:id (Founder) ────────────────────────

@router.put("/{startup_id}")
async def update_startup(
    startup_id: str,
    body: StartupUpdate,
    current_user: dict = Depends(require_role("founder")),
):
    """Update a draft startup before submission."""
    # Verify ownership and draft status
    existing = (
        supabase.table("startups")
        .select("*")
        .eq("id", startup_id)
        .eq("founder_id", current_user["id"])
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
        .eq("id", startup_id)
        .execute()
    )
    return result.data[0]


# ── POST /startups/:id/approve (Admin) ─────────────────

@router.post("/{startup_id}/approve")
async def approve_startup(
    startup_id: str,
    current_user: dict = Depends(require_role("admin")),
):
    """Admin approves a startup: status -> active."""
    existing = (
        supabase.table("startups")
        .select("status")
        .eq("id", startup_id)
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
        .eq("id", startup_id)
        .execute()
    )
    return {"message": "Startup approved", "startup": result.data[0]}


# ── POST /startups/:id/reject (Admin) ──────────────────

@router.post("/{startup_id}/reject")
async def reject_startup(
    startup_id: str,
    body: RejectReason,
    current_user: dict = Depends(require_role("admin")),
):
    """Admin rejects a startup with a reason."""
    existing = (
        supabase.table("startups")
        .select("status")
        .eq("id", startup_id)
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
        .eq("id", startup_id)
        .execute()
    )
    # NOTE: The reason could be stored in a separate column or audit log.
    return {
        "message": "Startup rejected",
        "reason": body.reason,
        "startup": result.data[0],
    }


# ── GET /startups/:id/investors (Admin) ─────────────────

@router.get("/{startup_id}/investors")
async def list_investors(
    startup_id: str,
    current_user: dict = Depends(require_role("admin")),
):
    """List all investors in a startup."""
    result = (
        supabase.table("investments")
        .select("*, users!investor_id(full_name, email)")
        .eq("startup_id", startup_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


# ── GET /startups/:id/milestones (All authenticated) ───

@router.get("/{startup_id}/milestones")
async def get_milestones(startup_id: str):
    """Get milestones for a startup (public)."""
    result = (
        supabase.table("milestones")
        .select("*")
        .eq("startup_id", startup_id)
        .order("order_index")
        .execute()
    )
    return result.data or []


# ── POST /startups/:id/milestones (Founder) ────────────

@router.post("/{startup_id}/milestones", status_code=status.HTTP_201_CREATED)
async def add_milestones(
    startup_id: str,
    milestones: List[MilestoneCreate],
    current_user: dict = Depends(require_role("founder")),
):
    """Add milestones to a startup (founder only, own startup)."""
    # Verify ownership
    existing = (
        supabase.table("startups")
        .select("id")
        .eq("id", startup_id)
        .eq("founder_id", current_user["id"])
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
            "startup_id": startup_id,
            "title": m.title,
            "description": m.description,
            "fund_percentage": m.fund_percentage,
            "status": "pending",
            "order_index": m.order_index,
        }
        for m in milestones
    ]

    result = supabase.table("milestones").insert(rows).execute()
    return result.data
