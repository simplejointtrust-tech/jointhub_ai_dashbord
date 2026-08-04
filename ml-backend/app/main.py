"""
JointHub Africa Capstone II — FastAPI ML backend.

Modules:
1. Opportunity recommendation (content-based cosine similarity)
2. Mentor-mentee matching (cosine + Hungarian assignment)
3. Dropout risk prediction (logistic regression + RF importance)
4. NLP goal analysis (NER + TF-IDF blend + recommendation sentences)

Sample data: ../data. Optional Google Sheets via sheets_loader.py.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

app = FastAPI(
    title="JointHub Africa Capstone ML API",
    description="AI modules for opportunity matching, mentorship, dropout risk, and NLP.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_json(name: str) -> Any:
    path = DATA_DIR / name
    if not path.exists():
        raise HTTPException(status_code=500, detail=f"Missing dataset file: {name}")
    return json.loads(path.read_text(encoding="utf-8"))


class LoginBody(BaseModel):
    email: str = Field(..., examples=["leader1@jointhub.demo"])


class OutreachBody(BaseModel):
    student_id: str


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "jointhub-capstone-ml",
        "modules": [
            "opportunity_recommendation",
            "mentor_matching",
            "dropout_risk",
            "nlp_pipeline",
        ],
        "data_dir": str(DATA_DIR),
    }


@app.get("/auth/users")
def auth_users() -> dict[str, Any]:
    return {"accounts": load_json("auth_users.json")}


@app.post("/auth/login")
def auth_login(body: LoginBody) -> dict[str, Any]:
    email = body.email.strip().lower()
    users = load_json("auth_users.json")
    user = next((u for u in users if u["email"].lower() == email), None)
    if not user:
        raise HTTPException(status_code=401, detail="Unknown demo account")
    return {"user": user}


@app.get("/kpis")
def kpis() -> dict[str, Any]:
    return load_json("kpis.json")


@app.get("/metrics")
def metrics() -> dict[str, Any]:
    return load_json("metrics.json")


@app.get("/students")
def students() -> dict[str, Any]:
    return {"students": load_json("students.json")}


@app.get("/opportunities/recommendations")
def recommendations(student_id: str | None = Query(default=None), email: str | None = Query(default=None)) -> dict[str, Any]:
    """Module 1 — top-5 content-based recommendations per student."""
    rows = load_json("recommendations.json")
    if email:
        email_l = email.strip().lower()
        rows = [r for r in rows if r.get("email", "").lower() == email_l]
    if student_id:
        rows = [r for r in rows if r.get("student_id") == student_id]
    return {
        "module": "opportunity_recommendation",
        "algorithm": "cosine_similarity + hard country/stage filters + optional TF-IDF blend",
        "count": len(rows),
        "results": rows,
    }


@app.get("/mentorship/matching")
def mentorship(student_id: str | None = Query(default=None)) -> dict[str, Any]:
    """Module 2 — Hungarian assignment + top-3 mentor recommendations."""
    data = load_json("mentorship.json")
    if student_id:
        data = {
            **data,
            "assignments": [a for a in data.get("assignments", []) if a["student_id"] == student_id],
            "top3_by_student": [t for t in data.get("top3_by_student", []) if t["student_id"] == student_id],
            "sessions": [s for s in data.get("sessions", []) if s["student_id"] == student_id],
        }
    return {
        "module": "mentor_mentee_matching",
        "algorithm": "cosine_similarity matrix + scipy.optimize.linear_sum_assignment",
        "data": data,
    }


@app.get("/risk/predictions")
def risk(student_id: str | None = Query(default=None)) -> dict[str, Any]:
    """Module 3 — logistic regression risk probabilities + RF feature importance."""
    data = load_json("risk.json")
    preds = data.get("predictions", data if isinstance(data, list) else [])
    if student_id:
        preds = [p for p in preds if p["student_id"] == student_id]
    return {
        "module": "dropout_risk_prediction",
        "algorithm": "LogisticRegression primary; RandomForestClassifier for importance",
        "threshold": data.get("threshold", 0.65) if isinstance(data, dict) else 0.65,
        "feature_importance": data.get("feature_importance", {}) if isinstance(data, dict) else {},
        "logistic_coefficients": data.get("logistic_coefficients", {}) if isinstance(data, dict) else {},
        "metrics": data.get("metrics", {}) if isinstance(data, dict) else {},
        "predictions": preds,
    }


@app.post("/risk/outreach")
def outreach(body: OutreachBody) -> dict[str, Any]:
    """Queue mentor outreach prompt for an at-risk student (no email send)."""
    data = load_json("risk.json")
    preds = data.get("predictions", [])
    row = next((p for p in preds if p["student_id"] == body.student_id), None)
    if not row:
        raise HTTPException(status_code=404, detail="Student not found in risk model output")
    return {
        "ok": True,
        "student_id": body.student_id,
        "full_name": row.get("full_name"),
        "risk_probability": row.get("risk_probability"),
        "outreach_prompt": row.get("outreach_prompt"),
        "status": "queued_for_mentor",
        "note": "Email delivery intentionally disabled in demo.",
    }


@app.get("/nlp/goals")
def nlp(student_id: str | None = Query(default=None)) -> dict[str, Any]:
    """Module 4 — NER entities + personalised recommendation sentences."""
    rows = load_json("nlp.json")
    if student_id:
        rows = [r for r in rows if r["student_id"] == student_id]
    return {
        "module": "nlp_pipeline",
        "stages": [
            "NER (ORG/SKILL/GPE/PRODUCT)",
            "TF-IDF vectorisation blended with interest tags",
            "semantic embedding match (384-d stub or sentence-BERT)",
            "personalised recommendation sentence",
        ],
        "results": rows,
    }


@app.get("/dashboard")
def dashboard(email: str = Query(..., description="Demo account email")) -> dict[str, Any]:
    """Aggregate payload for a student or admin dashboard view."""
    users = load_json("auth_users.json")
    user = next((u for u in users if u["email"].lower() == email.strip().lower()), None)
    if not user:
        raise HTTPException(status_code=401, detail="Unknown demo account")

    is_admin = user["role"] == "admin"
    student_id = user.get("student_id")
    students = load_json("students.json")
    student = next((s for s in students if s["student_id"] == student_id), None) if student_id else None

    recs = load_json("recommendations.json")
    if not is_admin and student_id:
        recs = [r for r in recs if r["student_id"] == student_id]

    ment = mentorship(student_id if not is_admin else None)["data"]
    risk_payload = risk(student_id if not is_admin else None)
    nlp_rows = nlp(student_id if not is_admin else None)["results"]

    return {
        "user": user,
        "student": student,
        "kpis": load_json("kpis.json"),
        "metrics": load_json("metrics.json"),
        "recommendations": recs,
        "mentorship": ment,
        "risk": risk_payload,
        "nlp": nlp_rows,
        "impact_figures": {
            "scholarships_usd": 158000,
            "students_supported": 85,
            "countries": 6,
        },
    }
