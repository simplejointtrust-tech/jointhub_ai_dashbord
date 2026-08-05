"""
Optional Google Sheets loader for the six Capstone datasets.

Environment variables (do not invent values; leave unset for sample JSON):
  JOINTHUB_GOOGLE_SERVICE_ACCOUNT_JSON  — path or raw JSON for service account
  JOINTHUB_SHEETS_WORKBOOK_ID           — spreadsheet ID
  JOINTHUB_SHEET_STUDENT_PROFILES       — worksheet name (default student_profiles)
  JOINTHUB_SHEET_SKILLS_INVENTORY
  JOINTHUB_SHEET_ACADEMIC_PERFORMANCE
  JOINTHUB_SHEET_MENTORSHIP_INTERACTIONS
  JOINTHUB_SHEET_OPPORTUNITY_LISTINGS
  JOINTHUB_SHEET_PLATFORM_ENGAGEMENT_LOGS

When credentials are missing, callers should fall back to sample JSON under data/.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any


SHEET_ENV = {
    "student_profiles": "JOINTHUB_SHEET_STUDENT_PROFILES",
    "skills_inventory": "JOINTHUB_SHEET_SKILLS_INVENTORY",
    "academic_performance": "JOINTHUB_SHEET_ACADEMIC_PERFORMANCE",
    "mentorship_interactions": "JOINTHUB_SHEET_MENTORSHIP_INTERACTIONS",
    "opportunity_listings": "JOINTHUB_SHEET_OPPORTUNITY_LISTINGS",
    "platform_engagement_logs": "JOINTHUB_SHEET_PLATFORM_ENGAGEMENT_LOGS",
}


def sheets_configured() -> bool:
    return bool(
        os.getenv("JOINTHUB_GOOGLE_SERVICE_ACCOUNT_JSON")
        and os.getenv("JOINTHUB_SHEETS_WORKBOOK_ID")
    )


def load_sheet_records(dataset: str) -> list[dict[str, Any]]:
    """Load a dataset from Google Sheets via gspread. Requires real credentials."""
    if not sheets_configured():
        raise RuntimeError(
            "Google Sheets not configured. Set JOINTHUB_GOOGLE_SERVICE_ACCOUNT_JSON "
            "and JOINTHUB_SHEETS_WORKBOOK_ID, or use sample JSON under ml-backend/data/."
        )

    try:
        import gspread
        from google.oauth2.service_account import Credentials
    except ImportError as exc:  # pragma: no cover
        raise RuntimeError(
            "Install gspread and google-auth to enable Sheets: pip install gspread google-auth"
        ) from exc

    creds_raw = os.environ["JOINTHUB_GOOGLE_SERVICE_ACCOUNT_JSON"]
    if Path(creds_raw).expanduser().exists():
        info = json.loads(Path(creds_raw).expanduser().read_text(encoding="utf-8"))
    else:
        info = json.loads(creds_raw)

    scopes = [
        "https://www.googleapis.com/auth/spreadsheets.readonly",
        "https://www.googleapis.com/auth/drive.readonly",
    ]
    credentials = Credentials.from_service_account_info(info, scopes=scopes)
    client = gspread.authorize(credentials)
    workbook = client.open_by_key(os.environ["JOINTHUB_SHEETS_WORKBOOK_ID"])
    worksheet_name = os.getenv(SHEET_ENV[dataset], dataset)
    worksheet = workbook.worksheet(worksheet_name)
    return worksheet.get_all_records()
