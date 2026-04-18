from __future__ import annotations

from typing import Any, Dict


def _alias(row: Dict[str, Any], target: str, *sources: str, default: Any = None) -> Any:
    if target in row and row[target] is not None:
        return row[target]
    for source in sources:
        if source in row and row[source] is not None:
            return row[source]
    return default


def normalize_user_row(row: Dict[str, Any]) -> Dict[str, Any]:
    normalized = dict(row)
    normalized["id"] = _alias(row, "id", "uid", "user_id")
    normalized["uid"] = _alias(row, "uid", "id", "user_id")
    normalized["user_id"] = _alias(row, "user_id", "id", "uid")
    normalized["created_at"] = _alias(row, "created_at", "time")
    normalized["time"] = _alias(row, "time", "created_at")
    normalized["kyc_status"] = _alias(row, "kyc_status", default="pending")
    normalized["wallet_balance"] = _alias(row, "wallet_balance", default=0)
    return normalized


def normalize_startup_row(row: Dict[str, Any]) -> Dict[str, Any]:
    normalized = dict(row)
    normalized["id"] = _alias(row, "id", "uid")
    normalized["uid"] = _alias(row, "uid", "id")
    normalized["created_at"] = _alias(row, "created_at", "time")
    normalized["time"] = _alias(row, "time", "created_at")
    normalized["investor_count"] = _alias(row, "investor_count", "investors_count", default=0)
    normalized["investors_count"] = _alias(row, "investors_count", "investor_count", default=0)
    amount_raised = float(_alias(row, "amount_raised", default=0) or 0)
    funding_goal = float(_alias(row, "funding_goal", default=0) or 0)
    normalized["funding_progress"] = round((amount_raised / funding_goal) * 100, 2) if funding_goal > 0 else 0
    return normalized


def normalize_milestone_row(row: Dict[str, Any]) -> Dict[str, Any]:
    normalized = dict(row)
    normalized["id"] = _alias(row, "id", "uid")
    normalized["uid"] = _alias(row, "uid", "id")
    normalized["created_at"] = _alias(row, "created_at", "time")
    normalized["time"] = _alias(row, "time", "created_at")
    normalized["submitted_at"] = _alias(row, "submitted_at", "updated_at", "created_at", "time")
    normalized["updated_at"] = _alias(row, "updated_at", "submitted_at", "created_at", "time")
    normalized["fund_percentage"] = _alias(row, "fund_percentage", default=0)
    normalized["rejection_reason"] = _alias(row, "rejection_reason")
    normalized["proof_url"] = _alias(row, "proof_url")
    normalized["status"] = _alias(row, "status", default="pending")
    return normalized


def normalize_investment_row(row: Dict[str, Any]) -> Dict[str, Any]:
    normalized = dict(row)
    normalized["id"] = _alias(row, "id", "uid")
    normalized["uid"] = _alias(row, "uid", "id")
    normalized["created_at"] = _alias(row, "created_at", "time")
    normalized["time"] = _alias(row, "time", "created_at")
    normalized["startup_id"] = _alias(row, "startup_id")
    normalized["investor_id"] = _alias(row, "investor_id", "user_id")
    normalized["user_id"] = _alias(row, "user_id", "investor_id")
    normalized["amount_pkr"] = _alias(row, "amount_pkr", "amount", default=0)
    normalized["amount"] = _alias(row, "amount", "amount_pkr", default=0)
    normalized["equity_percent"] = _alias(row, "equity_percent", "equity_percentage", default=0)
    normalized["equity_percentage"] = _alias(row, "equity_percentage", "equity_percent", default=0)
    return normalized


def normalize_transaction_row(row: Dict[str, Any]) -> Dict[str, Any]:
    normalized = dict(row)
    normalized["id"] = _alias(row, "id", "uid")
    normalized["uid"] = _alias(row, "uid", "id")
    normalized["created_at"] = _alias(row, "created_at", "time")
    normalized["time"] = _alias(row, "time", "created_at")
    normalized["user_id"] = _alias(row, "user_id", "uid")
    normalized["amount_pkr"] = _alias(row, "amount_pkr", "amount", default=0)
    normalized["amount"] = _alias(row, "amount", "amount_pkr", default=0)
    normalized["reference"] = _alias(row, "reference")
    normalized["type"] = _alias(row, "type", default="unknown")
    return normalized