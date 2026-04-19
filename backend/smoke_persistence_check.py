from __future__ import annotations

import sys
import uuid
from typing import Any, Dict, List

from fastapi.testclient import TestClient

from compat import (
    investment_investor_column,
    investment_startup_column,
    milestone_pk_column,
    milestone_startup_column,
    startup_founder_column,
    startup_pk_column,
    transaction_user_column,
    user_pk_column,
)
from config import supabase
from main import app


client = TestClient(app)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def request_json(method: str, path: str, token: str | None = None, payload: Dict[str, Any] | List[Dict[str, Any]] | None = None) -> Any:
    headers = {"Authorization": f"Bearer {token}"} if token else None
    print(f"-> {method} {path}", flush=True)
    response = client.request(method, path, json=payload, headers=headers, timeout=30)
    print(f"<- {method} {path} [{response.status_code}]", flush=True)
    if response.status_code >= 400:
        raise AssertionError(f"{method} {path} failed ({response.status_code}): {response.text}")
    if not response.text:
        return {}
    return response.json()


def register_and_login(role: str, full_name: str, password: str) -> Dict[str, Any]:
    email = f"{role}.{uuid.uuid4().hex[:10]}@example.com"

    request_json(
        "POST",
        "/auth/register",
        payload={
            "email": email,
            "password": password,
            "full_name": full_name,
            "role": role,
        },
    )

    login = request_json(
        "POST",
        "/auth/login",
        payload={
            "email": email,
            "password": password,
        },
    )

    token = login.get("access_token")
    require(bool(token), f"Missing access_token for {role}")

    me = request_json("GET", "/auth/me", token=token)
    require(me.get("role") == role, f"Expected role={role}, got {me.get('role')}")

    return {
        "email": email,
        "token": token,
        "user": me,
    }


def main() -> int:
    print("[1/6] Registering founder and creating startup...")
    founder = register_and_login("founder", "Founder Smoke", "Pass1234!")

    startup = request_json(
        "POST",
        "/startups",
        token=founder["token"],
        payload={
            "name": f"Smoke Startup {uuid.uuid4().hex[:6]}",
            "tagline": "Schema compatibility smoke test",
            "sector": "Fintech",
            "story": "Testing end-to-end persistence",
            "funding_goal": 500000,
            "equity_offered": 10,
            "pitch_deck_url": "https://example.com/pitch.pdf",
        },
    )

    startup_id = startup.get("id")
    require(bool(startup_id), "Startup id missing from create response")

    milestones_created = request_json(
        "POST",
        f"/startups/{startup_id}/milestones",
        token=founder["token"],
        payload=[
            {
                "title": "Prototype",
                "description": "Build MVP prototype",
                "fund_percentage": 40,
                "order_index": 1,
            },
            {
                "title": "Pilot",
                "description": "Run pilot with first users",
                "fund_percentage": 60,
                "order_index": 2,
            },
        ],
    )
    require(len(milestones_created) == 2, "Expected 2 milestones to be created")

    # Make startup investable for smoke validation.
    startup_pk = startup_pk_column()
    supabase.table("startups").update({"status": "active"}).eq(startup_pk, startup_id).execute()

    print("[2/6] Registering investor, depositing funds, and investing...")
    user_pk = user_pk_column()
    founder_id = founder["user"].get("id")
    # Reuse the same authenticated account and switch role for investor-only endpoints.
    supabase.table("users").update({"role": "investor"}).eq(user_pk, founder_id).execute()
    investor = founder

    request_json(
        "POST",
        "/auth/kyc",
        token=investor["token"],
        payload={"cnic": f"12345-1234567-{uuid.uuid4().int % 10}"},
    )

    request_json(
        "POST",
        "/wallet/deposit",
        token=investor["token"],
        payload={"amount_pkr": 250000},
    )

    invest_result = request_json(
        "POST",
        f"/invest/{startup_id}",
        token=investor["token"],
        payload={"amount_pkr": 100000},
    )
    require(bool(invest_result.get("investment", {}).get("id")), "Investment id missing")

    print("[3/6] Switching back to founder role for milestone ownership checks...")
    supabase.table("users").update({"role": "founder"}).eq(user_pk, founder_id).execute()
    milestone_id = milestones_created[0].get("id")
    require(bool(milestone_id), "Milestone id missing")

    print("[4/6] Reading portfolio and transactions endpoints...")
    portfolio = request_json("GET", "/portfolio", token=investor["token"])
    transactions = request_json("GET", "/wallet/transactions", token=investor["token"])
    require(isinstance(portfolio, list) and len(portfolio) >= 1, "Portfolio should contain at least 1 investment")
    require(isinstance(transactions, list) and len(transactions) >= 2, "Transactions should include deposit and investment")

    print("[5/6] Verifying direct DB persistence with adaptive columns...")
    investor_id = investor["user"].get("id")

    founder_in_db = supabase.table("users").select("*").eq(user_pk, founder_id).maybe_single().execute().data
    investor_in_db = supabase.table("users").select("*").eq(user_pk, investor_id).maybe_single().execute().data
    require(bool(founder_in_db), "Founder row missing in users table")
    require(bool(investor_in_db), "Investor row missing in users table")

    founder_fk = startup_founder_column()
    startup_row = supabase.table("startups").select("*").eq(startup_pk, startup_id).maybe_single().execute().data
    require(bool(startup_row), "Startup row missing in startups table")
    require(startup_row.get(founder_fk) == founder_id, "Startup founder FK mismatch")

    investment_investor_fk = investment_investor_column()
    investment_startup_fk = investment_startup_column()
    investment_rows = (
        supabase.table("investments")
        .select("*")
        .eq(investment_startup_fk, startup_id)
        .eq(investment_investor_fk, investor_id)
        .execute()
        .data
        or []
    )
    require(len(investment_rows) >= 1, "Investment row missing in investments table")

    transaction_user_fk = transaction_user_column()
    transaction_rows = (
        supabase.table("transactions")
        .select("*")
        .eq(transaction_user_fk, investor_id)
        .execute()
        .data
        or []
    )
    tx_types = {row.get("type") for row in transaction_rows}
    require("deposit" in tx_types and "investment" in tx_types, "Expected deposit and investment transactions")

    milestone_pk = milestone_pk_column()
    milestone_startup_fk = milestone_startup_column()
    milestone_row = supabase.table("milestones").select("*").eq(milestone_pk, milestone_id).maybe_single().execute().data
    require(bool(milestone_row), "Milestone row missing")
    require(milestone_row.get(milestone_startup_fk) == startup_id, "Milestone startup FK mismatch")
    require(milestone_row.get("status") in {"pending", "approved", "rejected"}, "Milestone status missing")

    print("[6/6] PASS: End-to-end persistence and schema compatibility verified.")
    print(f"Founder: {founder['email']}")
    print(f"Investor: {investor['email']}")
    print(f"Startup ID: {startup_id}")
    print(f"Milestone ID: {milestone_id}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"FAIL: {exc}")
        raise
