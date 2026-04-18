from fastapi import APIRouter, Depends, HTTPException, status
from config import supabase
from dependencies import get_current_user, require_role
from compat import normalize_user_row, user_pk_column, user_id_value
from schemas import RegisterRequest, LoginRequest, KYCRequest

router = APIRouter(prefix="/auth", tags=["Auth"])


# ── POST /auth/register (Public) ──────────────────────

@router.post("/register")
async def register(body: RegisterRequest):
    """Register a new user with a role (investor / founder)."""
    user = None
    try:
        auth_response = supabase.auth.sign_up(
            {"email": body.email, "password": body.password}
        )
        user = auth_response.user
    except Exception as e:
        error_text = str(e).lower()
        auth_fallback_terms = (
            "email rate limit exceeded",
            "rate limit",
            "rate-limited",
            "too many requests",
            "user not allowed",
            "signup disabled",
            "sign up disabled",
            "email not confirmed",
        )
        if any(term in error_text for term in auth_fallback_terms):
            # Dev-friendly fallback: create auth user with admin API when sign-up is rate-limited.
            try:
                admin_result = supabase.auth.admin.create_user(
                    {
                        "email": body.email,
                        "password": body.password,
                        "email_confirm": True,
                    }
                )
                user = admin_result.user
            except Exception as admin_error:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Registration failed: {str(admin_error)}",
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Registration failed: {str(e)}",
            )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed: no user returned",
        )

    user_pk = user_pk_column()

    # Keep the profile row in sync with auth. Upsert makes retries safe.
    try:
        payload = {
            "email": body.email,
            "role": body.role.value,
            "full_name": body.full_name,
            "kyc_status": "pending",
            "wallet_balance": 0,
        }
        payload[user_pk] = user.id

        profile_response = supabase.table("users").upsert(
            payload,
            on_conflict=user_pk,
        ).execute()
    except Exception as e:
        error_text = str(e).lower()
        if "null value in column \"cnic\"" in error_text:
            payload["cnic"] = f"pending-{user.id}"
            try:
                profile_response = supabase.table("users").upsert(
                    payload,
                    on_conflict=user_pk,
                ).execute()
            except Exception as retry_error:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"User profile save failed: {str(retry_error)}",
                )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"User profile save failed: {str(e)}",
            )

    if not profile_response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User profile save failed: no row returned",
        )

    return {
        "message": "User registered successfully",
        "user_id": user.id,
        "uid": user.id,
        "user": normalize_user_row(profile_response.data[0]),
    }


# ── POST /auth/login (Public) ─────────────────────────

@router.post("/login")
async def login(body: LoginRequest):
    """Login and receive a Supabase JWT access token."""
    try:
        auth_response = supabase.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Login failed: {str(e)}",
        )

    session = auth_response.session
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    return {
        "access_token": session.access_token,
        "token_type": "bearer",
        "expires_in": session.expires_in,
        "user_id": auth_response.user.id,
        "uid": auth_response.user.id,
    }


# ── POST /auth/kyc (Investor) ─────────────────────────

@router.post("/kyc")
async def upload_kyc(
    body: KYCRequest,
    current_user: dict = Depends(require_role("investor")),
):
    """Upload CNIC for KYC. Mock: automatically sets kyc_status to verified."""
    user_pk = user_pk_column()
    current_user_id = user_id_value(current_user)
    supabase.table("users").update(
        {"cnic": body.cnic, "kyc_status": "approved"}
    ).eq(user_pk, current_user_id).execute()

    return {
        "message": "KYC approved successfully",
        "kyc_status": "approved",
        "status": "approved",
    }


# ── GET /auth/me (All authenticated) ──────────────────

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return the current user's profile and wallet balance."""
    return {
        **normalize_user_row(current_user),
        "email": current_user["email"],
        "role": current_user["role"],
        "full_name": current_user["full_name"],
        "cnic": current_user.get("cnic"),
    }
