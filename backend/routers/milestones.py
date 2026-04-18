from fastapi import APIRouter, Depends, HTTPException, status
from config import supabase
from dependencies import require_role
from compat import normalize_milestone_row
from schemas import MilestoneSubmitProof, RejectReason

router = APIRouter(prefix="/milestones", tags=["Milestones"])


# ── POST /milestones/:id/submit (Founder) ─────────────

@router.post("/{milestone_id}/submit")
async def submit_milestone(
    milestone_id: str,
    body: MilestoneSubmitProof,
    current_user: dict = Depends(require_role("founder")),
):
    """Founder submits proof for milestone completion."""
    # Fetch milestone and verify ownership through startup
    milestone = (
        supabase.table("milestones")
        .select("*, startups!startup_id(founder_id)")
        .eq("id", milestone_id)
        .maybe_single()
        .execute()
    )
    if not milestone.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found",
        )

    startup_info = milestone.data.get("startups")
    if not startup_info or startup_info["founder_id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't own this startup's milestone",
        )

    if milestone.data["status"] != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Milestone is already '{milestone.data['status']}', cannot submit",
        )

    result = (
        supabase.table("milestones")
        .update({"proof_url": body.proof_url, "status": "submitted"})
        .eq("id", milestone_id)
        .execute()
    )
    return {
        "message": "Milestone submitted for review",
        "milestone": normalize_milestone_row(result.data[0]),
    }


# ── POST /milestones/:id/approve (Admin) ───────────────

@router.post("/{milestone_id}/approve")
async def approve_milestone(
    milestone_id: str,
    current_user: dict = Depends(require_role("admin")),
):
    """
    Admin approves a milestone.
    Releases the milestone's fund_percentage of the startup's amount_raised
    to the founder's wallet.
    """
    # Fetch milestone with startup info
    milestone = (
        supabase.table("milestones")
        .select("*, startups!startup_id(id, founder_id, amount_raised)")
        .eq("id", milestone_id)
        .maybe_single()
        .execute()
    )
    if not milestone.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found",
        )
    if milestone.data["status"] != "submitted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only submitted milestones can be approved",
        )

    startup = milestone.data["startups"]
    fund_percentage = milestone.data["fund_percentage"]
    release_amount = round(
        (fund_percentage / 100) * startup["amount_raised"], 2
    )

    # Update milestone status
    supabase.table("milestones").update({"status": "approved"}).eq(
        "id", milestone_id
    ).execute()

    # Add released funds to founder's wallet
    founder = (
        supabase.table("users")
        .select("wallet_balance")
        .eq("id", startup["founder_id"])
        .single()
        .execute()
    )
    new_balance = founder.data["wallet_balance"] + release_amount
    supabase.table("users").update({"wallet_balance": new_balance}).eq(
        "id", startup["founder_id"]
    ).execute()

    # Record transaction for fund release
    supabase.table("transactions").insert(
        {
            "user_id": startup["founder_id"],
            "type": "fund_release",
            "amount_pkr": release_amount,
            "reference": f"Milestone approved: {milestone.data['title']}",
        }
    ).execute()

    return {
        "message": "Milestone approved, funds released",
        "release_amount": release_amount,
        "milestone_id": milestone_id,
    }


# ── POST /milestones/:id/reject (Admin) ────────────────

@router.post("/{milestone_id}/reject")
async def reject_milestone(
    milestone_id: str,
    body: RejectReason,
    current_user: dict = Depends(require_role("admin")),
):
    """Admin rejects a milestone submission with a reason."""
    milestone = (
        supabase.table("milestones")
        .select("status")
        .eq("id", milestone_id)
        .maybe_single()
        .execute()
    )
    if not milestone.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found",
        )
    if milestone.data["status"] != "submitted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only submitted milestones can be rejected",
        )

    result = (
        supabase.table("milestones")
        .update({"status": "rejected"})
        .eq("id", milestone_id)
        .execute()
    )
    return {
        "message": "Milestone rejected",
        "reason": body.reason,
        "milestone": normalize_milestone_row(result.data[0]),
    }
