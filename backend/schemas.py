from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


# ── Enums ──────────────────────────────────────────────

class UserRole(str, Enum):
    investor = "investor"
    founder = "founder"
    admin = "admin"


class Sector(str, Enum):
    agri = "Agri"
    fintech = "Fintech"
    edtech = "EdTech"
    health = "Health"
    retail = "Retail"
    other = "Other"


# ── Auth Schemas ───────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)
    full_name: str
    role: UserRole


class LoginRequest(BaseModel):
    email: str
    password: str


class KYCRequest(BaseModel):
    cnic: str = Field(
        description="Pakistani CNIC number, e.g. 12345-1234567-1"
    )


# ── Startup Schemas ────────────────────────────────────

class StartupCreate(BaseModel):
    name: str
    tagline: str
    sector: Sector
    story: str
    funding_goal: float = Field(gt=0)
    equity_offered: float = Field(gt=0, le=100)
    pitch_deck_url: Optional[str] = None


class StartupUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    sector: Optional[Sector] = None
    story: Optional[str] = None
    funding_goal: Optional[float] = None
    equity_offered: Optional[float] = None
    pitch_deck_url: Optional[str] = None


# ── Milestone Schemas ──────────────────────────────────

class MilestoneCreate(BaseModel):
    title: str
    description: str
    fund_percentage: float = Field(
        gt=0, le=100, description="% of raised funds unlocked on completion"
    )
    order_index: int = Field(ge=1)


class MilestoneSubmitProof(BaseModel):
    proof_url: str


# ── Invest Schemas ─────────────────────────────────────

class InvestRequest(BaseModel):
    amount_pkr: float = Field(gt=0)


# ── Wallet Schemas ─────────────────────────────────────

class DepositRequest(BaseModel):
    amount_pkr: float = Field(gt=0)


# ── Admin Schemas ──────────────────────────────────────

class RejectReason(BaseModel):
    reason: str
