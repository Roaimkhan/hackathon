from fastapi import APIRouter, Depends, HTTPException, status
from config import supabase
from dependencies import require_role
from compat import (
    normalize_milestone_row,
    milestone_pk_column,
    milestone_startup_column,
    startup_pk_column,
    startup_founder_column,
    user_pk_column,
    transaction_user_column,
    user_id_value,
)
from schemas import MilestoneSubmitProof, RejectReason

router = APIRouter(prefix="/milestones", tags=["Milestones"])


# ── POST /milestones/:id/submit (Founder) ─────────────

@router.post("/{milestone_id}/submit")
async def submit_milestone(
    milestone_id: str,
    body: MilestoneSubmitProof,
    current_user: dict = Depends(require_role("founder")),
):
    """Founder submits proof for milestone completion - INSTANT AUTO-APPROVAL & FUND RELEASE."""
    milestone_pk = milestone_pk_column()
    milestone_startup_fk = milestone_startup_column()
    startup_pk = startup_pk_column()
    startup_founder_fk = startup_founder_column()
    user_pk = user_pk_column()
    transaction_user_fk = transaction_user_column()
    current_user_id = user_id_value(current_user)

    # Fetch milestone first, then verify startup ownership without schema-specific join names.
    milestone = (
        supabase.table("milestones")
        .select("*")
        .eq(milestone_pk, milestone_id)
        .maybe_single()
        .execute()
    )
    if not milestone.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found",
        )

    startup_id = milestone.data.get(milestone_startup_fk)
    startup_result = (
        supabase.table("startups")
        .select("*")
        .eq(startup_pk, startup_id)
        .maybe_single()
        .execute()
    )
    startup_info = startup_result.data
    if not startup_info or startup_info.get(startup_founder_fk) != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't own this startup's milestone",
        )

    if milestone.data["status"] != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Milestone is already '{milestone.data['status']}', cannot submit",
        )

    # INSTANT AUTO-APPROVAL: Update milestone status to approved (skip submitted)
    supabase.table("milestones").update(
        {"proof_url": body.proof_url, "status": "approved"}
    ).eq(milestone_pk, milestone_id).execute()

    # Calculate and release funds immediately
    fund_percentage = milestone.data["fund_percentage"]
    release_amount = round(
        (fund_percentage / 100) * startup_info["amount_raised"], 2
    )

    # Add released funds to founder's wallet
    founder_id = startup_info.get(startup_founder_fk)
    founder = (
        supabase.table("users")
        .select("wallet_balance")
        .eq(user_pk, founder_id)
        .single()
        .execute()
    )
    new_balance = founder.data["wallet_balance"] + release_amount
    supabase.table("users").update({"wallet_balance": new_balance}).eq(
        user_pk, founder_id
    ).execute()

    # Record transaction for fund release
    supabase.table("transactions").insert(
        {
            transaction_user_fk: founder_id,
            "type": "fund_release",
            "amount_pkr": release_amount,
            "reference": f"Milestone completed: {milestone.data['title']}",
        }
    ).execute()

    return {
        "message": "Milestone completed! Funds released instantly to your wallet ✓",
        "release_amount": release_amount,
        "milestone_id": milestone_id,
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
    milestone_pk = milestone_pk_column()
    milestone_startup_fk = milestone_startup_column()
    startup_pk = startup_pk_column()
    startup_founder_fk = startup_founder_column()
    user_pk = user_pk_column()
    transaction_user_fk = transaction_user_column()

    # Fetch milestone and then startup info without depending on relation name syntax.
    milestone = (
        supabase.table("milestones")
        .select("*")
        .eq(milestone_pk, milestone_id)
        .maybe_single()
        .execute()
    )
    if not milestone.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found",
        )
    if milestone.data["status"] != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending milestones can be approved",
        )

    startup_id = milestone.data.get(milestone_startup_fk)
    startup_result = (
        supabase.table("startups")
        .select("*")
        .eq(startup_pk, startup_id)
        .maybe_single()
        .execute()
    )
    startup = startup_result.data
    if not startup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Startup not found for milestone",
        )

    fund_percentage = milestone.data["fund_percentage"]
    release_amount = round(
        (fund_percentage / 100) * startup["amount_raised"], 2
    )

    # Update milestone status
    supabase.table("milestones").update({"status": "approved"}).eq(
        milestone_pk, milestone_id
    ).execute()

    # Add released funds to founder's wallet
    founder_id = startup.get(startup_founder_fk)
    founder = (
        supabase.table("users")
        .select("wallet_balance")
        .eq(user_pk, founder_id)
        .single()
        .execute()
    )
    new_balance = founder.data["wallet_balance"] + release_amount
    supabase.table("users").update({"wallet_balance": new_balance}).eq(
        user_pk, founder_id
    ).execute()

    # Record transaction for fund release
    supabase.table("transactions").insert(
        {
            transaction_user_fk: founder_id,
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
    milestone_pk = milestone_pk_column()
    milestone = (
        supabase.table("milestones")
        .select("status")
        .eq(milestone_pk, milestone_id)
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
        .eq(milestone_pk, milestone_id)
        .execute()
    )
    return {
        "message": "Milestone rejected",
        "reason": body.reason,
        "milestone": normalize_milestone_row(result.data[0]),
    }
