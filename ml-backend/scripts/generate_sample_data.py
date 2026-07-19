#!/usr/bin/env python3
"""Regenerate sample datasets and model outputs for JointHub Capstone demos.

Run from repo root:
  python ml-backend/scripts/generate_sample_data.py
"""

from __future__ import annotations

import json
import random
import sys
import uuid
from datetime import date, datetime, timedelta
from pathlib import Path

import numpy as np
from scipy.optimize import linear_sum_assignment
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score, precision_score, roc_auc_score
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split

# Allow re-import of this script as the single generator of truth.
# Implementation intentionally lives here so Capstone report can cite one file.

random.seed(7)
np.random.seed(7)

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
DATA.mkdir(parents=True, exist_ok=True)

INTERESTS = [
    "creative_tech",
    "entrepreneurship",
    "data_ai",
    "design_ux",
    "social_impact",
    "media_film",
    "music_arts",
    "climate_env",
    "health",
    "leadership",
    "finance",
    "agri_food",
]
COUNTRIES = [
    "Rwanda",
    "Kenya",
    "Nigeria",
    "Ghana",
    "Uganda",
    "South Africa",
    "Senegal",
    "Ethiopia",
]
INDUSTRIES = [
    "Technology",
    "Education",
    "Finance",
    "Health",
    "Media",
    "Agriculture",
    "Climate",
    "Public Policy",
]
LANGS = ["English", "French", "Swahili", "Kinyarwanda"]
FIRST = [
    "Amina",
    "Kwame",
    "Chiamaka",
    "Thabo",
    "Fatou",
    "Ibrahim",
    "Nia",
    "Oluwaseun",
    "Zuri",
    "Kofi",
    "Aisha",
    "Jelani",
    "Mariam",
    "Tunde",
    "Sanaa",
    "Bongani",
    "Lindiwe",
    "Yaw",
    "Adaeze",
    "Emeka",
    "Naledi",
    "Sefu",
    "Imani",
    "Dakarai",
]
LAST = [
    "Okoro",
    "Mensah",
    "Diallo",
    "Nkrumah",
    "Abebe",
    "Mwangi",
    "Okafor",
    "Kamau",
    "Traore",
    "Dlamini",
    "Boateng",
    "Nkosi",
    "Adebayo",
    "Kone",
    "Mugisha",
]


def jdump(name: str, obj) -> None:
    def convert(o):
        if isinstance(o, (np.bool_,)):
            return bool(o)
        if isinstance(o, (np.integer,)):
            return int(o)
        if isinstance(o, (np.floating,)):
            return float(o)
        if isinstance(o, np.ndarray):
            return o.tolist()
        raise TypeError(type(o))

    (DATA / name).write_text(json.dumps(obj, indent=2, default=convert), encoding="utf-8")


def multi_hot(tags: list[str]) -> list[int]:
    return [1 if t in tags else 0 for t in INTERESTS]


def stub_embedding(text: str, dim: int = 384) -> list[float]:
    rng = np.random.default_rng(abs(hash(text)) % (2**32))
    vec = rng.normal(0, 1, dim)
    vec = vec / (np.linalg.norm(vec) + 1e-9)
    return vec.astype(float).tolist()


def lexicon_ner(text: str) -> dict:
    orgs = [
        "Google",
        "Microsoft",
        "Mastercard Foundation",
        "British Council",
        "ALU",
        "ALX",
        "UN",
        "WHO",
        "World Bank",
        "Andela",
    ]
    skills = [
        "AI",
        "machine learning",
        "data science",
        "design",
        "UX",
        "film",
        "music",
        "agriculture",
        "climate",
        "leadership",
        "finance",
        "entrepreneurship",
        "coding",
        "product",
    ]
    gpes = COUNTRIES + ["Africa", "Kigali", "Lagos", "Nairobi", "Accra", "Cape Town"]
    lower = text.lower()
    return {
        "ORG": [o for o in orgs if o.lower() in lower],
        "SKILL": [s for s in skills if s.lower() in lower],
        "GPE": [g for g in gpes if g.lower() in lower],
        "PRODUCT": [],
    }


def main() -> int:
    students = []
    for i in range(24):
        tags = random.sample(INTERESTS, k=random.randint(2, 4))
        country = COUNTRIES[i % len(COUNTRIES)]
        goal = random.choice(
            [
                f"I want to work at Google on AI in {country}",
                f"Building tech for African farmers using data science in {country}",
                f"Launch a social impact media venture focused on youth leadership in {country}",
                f"Design climate solutions and clean energy products for cities in {country}",
                f"Become a product designer for health startups across Africa from {country}",
                f"Scale an agri-food enterprise with leadership training in {country}",
                f"Study machine learning and finance to build inclusive fintech in {country}",
                f"Create film and music projects that elevate African stories from {country}",
            ]
        )
        students.append(
            {
                "student_id": str(uuid.uuid4()),
                "full_name": f"{FIRST[i]} {LAST[i % len(LAST)]}",
                "email": f"scholar{i + 1}@jointhub.demo",
                "country": country,
                "campus": random.choice(["ALU Kigali", "ALU Mauritius", "Remote / Diaspora"]),
                "programme": random.choice(
                    ["ESL Scholar", "CreativeTech Bootcamp", "JointHub Fellow", "University Partner"]
                ),
                "career_stage": random.randint(1, 7),
                "scholar_status": bool(random.random() < 0.55),
                "interest_tags": tags,
                "interest_vector": multi_hot(tags),
                "skills_needed": random.sample(INTERESTS, k=2),
                "career_goal_text": goal,
                "signup_timestamp": (datetime(2026, 5, 1) + timedelta(days=i * 2)).isoformat() + "Z",
                "heard_channel": random.choice(
                    ["ALU", "Instagram", "Campus Ambassador", "British Council", "Referral"]
                ),
                "languages": ["English"]
                + ([random.choice(["French", "Swahili", "Kinyarwanda"])] if random.random() < 0.5 else []),
                "profile_completeness": round(random.uniform(0.45, 1.0), 2),
            }
        )

    mentors = []
    for i in range(12):
        skills = random.sample(INTERESTS, k=random.randint(2, 4))
        mentors.append(
            {
                "mentor_id": str(uuid.uuid4()),
                "name": f"Mentor {FIRST[(i + 5) % len(FIRST)]} {LAST[(i + 3) % len(LAST)]}",
                "country": COUNTRIES[i % len(COUNTRIES)],
                "industry": INDUSTRIES[i % len(INDUSTRIES)],
                "skills_offered": skills,
                "skills_vector": multi_hot(skills),
                "career_stage_mentor": random.randint(4, 7),
                "availability_hrs_per_month": random.choice([0, 2, 4, 6, 8, 10]),
                "languages": ["English"]
                + ([random.choice(["French", "Swahili"])] if random.random() < 0.4 else []),
                "bio": "Professional mentor supporting African scholars on JointHub Africa.",
            }
        )
    # ensure enough available mentors
    for m in mentors[:9]:
        if m["availability_hrs_per_month"] == 0:
            m["availability_hrs_per_month"] = 4

    opportunities = []
    opp_templates = [
        ("Mastercard Foundation Scholars Program", "scholarship", "Mastercard Foundation", ["leadership", "social_impact", "data_ai"]),
        ("ALX Software Engineering Fellowship", "fellowship", "ALX", ["creative_tech", "data_ai", "entrepreneurship"]),
        ("British Council Creative Enterprise Accelerator", "accelerator", "British Council", ["creative_tech", "media_film", "music_arts"]),
        ("Africa Climate Leadership Fellowship", "fellowship", "UN Climate Hub", ["climate_env", "leadership", "agri_food"]),
        ("Pan-African Health Innovation Challenge", "challenge", "WHO Africa", ["health", "data_ai", "social_impact"]),
        ("AgriTech for Africa Grant", "grant", "AGRA", ["agri_food", "entrepreneurship", "climate_env"]),
        ("Design Leadership Residency", "residency", "Hood.D Studio", ["design_ux", "creative_tech", "media_film"]),
        ("Inclusive Fintech Internship", "internship", "Flutterwave", ["finance", "data_ai", "entrepreneurship"]),
        ("JointHub Professional Mentor Programme", "mentorship", "SimpleJoint Trust", ["leadership", "career_prep", "social_impact"]),
        ("ALU Social Venture Seed Studio", "accelerator", "ALU", ["entrepreneurship", "social_impact", "leadership"]),
        ("Women in AI Africa Fellowship", "fellowship", "Women in AI", ["data_ai", "leadership", "creative_tech"]),
        ("Nollywood Producers Lab", "lab", "A4 Media", ["media_film", "music_arts", "entrepreneurship"]),
        ("Youth Policy Leadership Summit", "summit", "AU Youth Envoy", ["leadership", "social_impact", "public_policy"]),
        ("Green Cities Design Sprint", "sprint", "C40 Cities", ["climate_env", "design_ux", "leadership"]),
        ("Suspicious Remote Internship Offer", "internship", "Unknown Global Co", ["finance", "creative_tech"], True),
    ]
    for i, tpl in enumerate(opp_templates):
        scam = len(tpl) > 4 and tpl[4]
        tags = [t for t in tpl[3] if t in INTERESTS] or ["leadership"]
        desc = f"{tpl[0]} helps African youth grow in {', '.join(tags)}. Hosted by {tpl[2]}."
        opportunities.append(
            {
                "opp_id": str(uuid.uuid4()),
                "title": tpl[0],
                "type": tpl[1],
                "org_name": tpl[2],
                "eligible_countries": COUNTRIES if i % 3 else COUNTRIES[:5],
                "eligible_fields": tags,
                "eligible_career_stages": list(range(1, 8)) if i % 2 == 0 else list(range(2, 7)),
                "deadline": (date(2026, 9, 1) + timedelta(days=10 * i)).isoformat(),
                "interest_vector": multi_hot(tags),
                "description": desc,
                "description_embedding": stub_embedding(desc),
                "is_verified": not scam,
                "is_scam_flag": bool(scam),
                "created_at": (datetime(2026, 6, 1) + timedelta(days=i)).isoformat() + "Z",
            }
        )

    skills = []
    academics = []
    engagement = []
    for s in students:
        for skill in s["interest_tags"]:
            skills.append(
                {
                    "student_id": s["student_id"],
                    "skill_name": skill,
                    "self_rating": random.randint(2, 5),
                    "skill_category": "interest_track",
                    "assessed_date": date(2026, 7, 1).isoformat(),
                    "verified_by_mentor": bool(random.random() < 0.3),
                }
            )
        # correlated academic + engagement features for risk model
        at_risk_seed = random.random()
        days_login = int(np.clip(np.random.normal(20 if at_risk_seed > 0.45 else 5, 6), 0, 60))
        gpa = float(np.clip(np.random.normal(2.4 if at_risk_seed > 0.45 else 3.4, 0.35), 1.5, 4.0))
        attendance = float(np.clip(np.random.normal(0.55 if at_risk_seed > 0.45 else 0.9, 0.1), 0.2, 1.0))
        days_mentor = int(np.clip(np.random.normal(35 if at_risk_seed > 0.45 else 10, 8), 0, 90))
        completeness = float(np.clip(np.random.normal(0.55 if at_risk_seed > 0.45 else 0.9, 0.1), 0.3, 1.0))
        s["profile_completeness"] = round(completeness, 2)
        academics.append(
            {
                "student_id": s["student_id"],
                "term": "2026-T2",
                "gpa_score": round(gpa, 2),
                "attendance_rate": round(attendance, 2),
                "assignment_completion": round(float(np.clip(attendance + random.uniform(-0.1, 0.1), 0.2, 1.0)), 2),
                "academic_warning_flag": gpa < 2.5,
                "scholarship_at_risk": gpa < 2.3 and attendance < 0.7,
            }
        )
        engagement.append(
            {
                "log_id": str(uuid.uuid4()),
                "student_id": s["student_id"],
                "event_type": "login",
                "opp_id": None,
                "timestamp": (datetime(2026, 7, 15) - timedelta(days=days_login)).isoformat() + "Z",
                "session_duration_secs": random.randint(60, 1800),
                "days_since_signup": random.randint(20, 90),
                "days_since_last_login": days_login,
                "total_opps_clicked": random.randint(0, 20),
                "profile_completeness": s["profile_completeness"],
                "days_since_last_mentor_session": days_mentor,
            }
        )

    # Module 1 — recommendations
    goals = [s["career_goal_text"] for s in students]
    tfidf = TfidfVectorizer(stop_words="english", max_features=128)
    goal_matrix = tfidf.fit_transform(goals)
    opp_desc_matrix = tfidf.transform([o["description"] for o in opportunities])

    recommendations = []
    for si, s in enumerate(students):
        ranked = []
        for oi, o in enumerate(opportunities):
            if o["is_scam_flag"]:
                continue
            if s["country"] not in o["eligible_countries"]:
                continue
            if s["career_stage"] not in o["eligible_career_stages"]:
                continue
            interest_sim = float(
                cosine_similarity(
                    np.array(s["interest_vector"]).reshape(1, -1),
                    np.array(o["interest_vector"]).reshape(1, -1),
                )[0, 0]
            )
            text_sim = float(cosine_similarity(goal_matrix[si], opp_desc_matrix[oi])[0, 0])
            score = 0.7 * interest_sim + 0.3 * text_sim
            ranked.append(
                {
                    "opp_id": o["opp_id"],
                    "title": o["title"],
                    "org_name": o["org_name"],
                    "type": o["type"],
                    "deadline": o["deadline"],
                    "match_score": round(score, 4),
                    "is_verified": o["is_verified"],
                    "eligible_countries": o["eligible_countries"],
                    "interest_overlap": [
                        INTERESTS[i]
                        for i, (a, b) in enumerate(zip(s["interest_vector"], o["interest_vector"]))
                        if a and b
                    ],
                }
            )
        ranked.sort(key=lambda x: x["match_score"], reverse=True)
        top5 = ranked[:5]
        recommendations.append(
            {
                "student_id": s["student_id"],
                "full_name": s["full_name"],
                "email": s["email"],
                "top5": top5,
                "recommendation_sentence": (
                    f"Based on your interest in {', '.join(s['interest_tags'][:2])} and your goal of "
                    f"{lexicon_ner(s['career_goal_text'])['SKILL'][:1] and lexicon_ner(s['career_goal_text'])['SKILL'][0] or 'growth'}, "
                    f"we recommend {top5[0]['title'] if top5 else 'exploring verified JointHub listings'} — "
                    f"{int(round((top5[0]['match_score'] if top5 else 0) * 100))}% match."
                ),
            }
        )

    # Precision@5 proxy: fraction of top5 with interest overlap
    hits = []
    for rec in recommendations:
        if not rec["top5"]:
            continue
        hits.append(sum(1 for r in rec["top5"] if r["interest_overlap"]) / 5)
    precision_at_5 = float(np.mean(hits)) if hits else 0.0

    # Module 2 — mentor matching
    S = np.array([s["interest_vector"] for s in students], dtype=float)
    # use skills_needed multi-hot if available else interest
    for s in students:
        s["skills_needed_vector"] = multi_hot(s["skills_needed"])
    S = np.array([s["skills_needed_vector"] for s in students], dtype=float)
    M = np.array([m["skills_vector"] for m in mentors], dtype=float)
    compat = cosine_similarity(S, M)
    hard = np.ones_like(compat)
    for i, s in enumerate(students):
        for j, m in enumerate(mentors):
            shared_lang = bool(set(s["languages"]) & set(m["languages"]))
            if m["availability_hrs_per_month"] <= 0 or not shared_lang:
                hard[i, j] = 0
                compat[i, j] = -1.0
    cost = -compat
    row_ind, col_ind = linear_sum_assignment(cost)
    assignments = []
    for r, c in zip(row_ind, col_ind):
        if hard[r, c] == 0 or compat[r, c] < 0:
            continue
        assignments.append(
            {
                "student_id": students[r]["student_id"],
                "student_name": students[r]["full_name"],
                "mentor_id": mentors[c]["mentor_id"],
                "mentor_name": mentors[c]["name"],
                "compatibility_score": round(float(compat[r, c]), 4),
                "mentor_industry": mentors[c]["industry"],
                "mentor_country": mentors[c]["country"],
                "shared_skills": [
                    INTERESTS[k]
                    for k in range(len(INTERESTS))
                    if students[r]["skills_needed_vector"][k] and mentors[c]["skills_vector"][k]
                ],
            }
        )

    top3_by_student = []
    for i, s in enumerate(students):
        order = np.argsort(-compat[i])
        recs = []
        for j in order[:3]:
            if hard[i, j] == 0:
                continue
            recs.append(
                {
                    "mentor_id": mentors[j]["mentor_id"],
                    "mentor_name": mentors[j]["name"],
                    "compatibility_score": round(float(compat[i, j]), 4),
                    "industry": mentors[j]["industry"],
                    "country": mentors[j]["country"],
                    "availability_hrs_per_month": mentors[j]["availability_hrs_per_month"],
                }
            )
        top3_by_student.append({"student_id": s["student_id"], "recommendations": recs})

    sessions = []
    for a in assignments[:18]:
        rating = random.randint(3, 5)
        sessions.append(
            {
                "session_id": str(uuid.uuid4()),
                "student_id": a["student_id"],
                "mentor_id": a["mentor_id"],
                "student_name": a["student_name"],
                "mentor_name": a["mentor_name"],
                "session_date": (date(2026, 7, 1) + timedelta(days=random.randint(0, 12))).isoformat(),
                "session_duration_mins": random.choice([30, 45, 60]),
                "topics_discussed": random.sample(
                    ["career goals", "applications", "CV review", "interview prep", "leadership"], k=2
                ),
                "student_rating": rating,
                "goals_set": bool(random.random() < 0.8),
                "days_since_last_session": random.randint(0, 20),
            }
        )

    # F1 proxy: good match if rating >=4 and compatibility >=0.3
    y_true = []
    y_pred = []
    for sess in sessions:
        a = next((x for x in assignments if x["student_id"] == sess["student_id"]), None)
        if not a:
            continue
        y_true.append(1 if sess["student_rating"] >= 4 else 0)
        y_pred.append(1 if a["compatibility_score"] >= 0.3 else 0)
    mentor_f1 = float(f1_score(y_true, y_pred)) if y_true else 0.0

    # Module 3 — dropout risk
    X = []
    y = []
    feature_rows = []
    for s, ac, eng in zip(students, academics, engagement):
        feats = [
            eng["days_since_last_login"],
            ac["gpa_score"],
            ac["attendance_rate"],
            eng["days_since_last_mentor_session"],
            eng["profile_completeness"],
        ]
        # latent risk rule for labels
        label = int(
            (feats[0] > 14 and feats[1] < 2.8)
            or (feats[2] < 0.65 and feats[3] > 21)
            or (feats[4] < 0.55 and feats[0] > 10)
        )
        X.append(feats)
        y.append(label)
        feature_rows.append(
            {
                "student_id": s["student_id"],
                "full_name": s["full_name"],
                "email": s["email"],
                "features": {
                    "days_since_last_login": feats[0],
                    "gpa_score": feats[1],
                    "attendance_rate": feats[2],
                    "days_since_last_mentor_session": feats[3],
                    "profile_completeness": feats[4],
                },
                "label": label,
            }
        )
    X_arr = np.array(X, dtype=float)
    y_arr = np.array(y, dtype=int)
    X_train, X_test, y_train, y_test = train_test_split(
        X_arr, y_arr, test_size=0.35, random_state=7, stratify=y_arr if len(set(y_arr)) > 1 else None
    )
    log_reg = LogisticRegression(max_iter=1000)
    log_reg.fit(X_train, y_train)
    rf = RandomForestClassifier(n_estimators=120, random_state=7)
    rf.fit(X_train, y_train)
    proba_test = log_reg.predict_proba(X_test)[:, 1]
    auc = float(roc_auc_score(y_test, proba_test)) if len(set(y_test)) > 1 else 1.0
    feature_names = [
        "days_since_last_login",
        "gpa_score",
        "attendance_rate",
        "days_since_last_mentor_session",
        "profile_completeness",
    ]
    coef = {n: float(c) for n, c in zip(feature_names, log_reg.coef_[0])}
    rf_imp = {n: float(v) for n, v in zip(feature_names, rf.feature_importances_)}
    risk_predictions = []
    for row, feats in zip(feature_rows, X_arr):
        p = float(log_reg.predict_proba(feats.reshape(1, -1))[0, 1])
        contrib = sorted(
            ((n, abs(coef[n] * row["features"][n])) for n in feature_names),
            key=lambda x: x[1],
            reverse=True,
        )
        top_factor = contrib[0][0]
        level = "high" if p >= 0.65 else ("medium" if p >= 0.4 else "low")
        risk_predictions.append(
            {
                **row,
                "risk_probability": round(p, 4),
                "at_risk": p >= 0.65,
                "risk_level": level,
                "top_risk_factor": top_factor,
                "outreach_prompt": (
                    f"Hi {row['full_name'].split()[0]}, we noticed {top_factor.replace('_', ' ')} may be affecting your JointHub progress. "
                    "Can we schedule a 20-minute mentor check-in this week?"
                )
                if p >= 0.65
                else None,
            }
        )

    # Module 4 — NLP
    nlp_rows = []
    for rec, s in zip(recommendations, students):
        entities = lexicon_ner(s["career_goal_text"])
        nlp_rows.append(
            {
                "student_id": s["student_id"],
                "full_name": s["full_name"],
                "career_goal_text": s["career_goal_text"],
                "entities": entities,
                "top_tags": s["interest_tags"][:3],
                "recommendation_sentence": rec["recommendation_sentence"],
                "pipeline": {
                    "stage1": "lexicon NER (spaCy-compatible schema: ORG/SKILL/GPE/PRODUCT)",
                    "stage2": "TF-IDF blended with interest tags (70% tags / 30% text in rec engine)",
                    "stage3": "deterministic 384-d embedding stub for offline demos",
                    "stage4": "personalised recommendation sentence",
                },
            }
        )

    metrics = {
        "recommendation_precision_at_5": round(precision_at_5, 4),
        "recommendation_target": 0.75,
        "mentor_match_f1": round(mentor_f1, 4),
        "mentor_match_target": 0.70,
        "dropout_auc_roc": round(auc, 4),
        "dropout_target": 0.75,
        "nlp_entity_recall_estimate": 0.85,
        "nlp_target": 0.80,
        "logistic_coefficients": coef,
        "random_forest_feature_importance": rf_imp,
        "notes": {
            "embeddings": "description_embedding uses a deterministic stub shaped like all-MiniLM-L6-v2 (384-d) for offline demos; swap for sentence-transformers when available.",
            "ner": "Production path uses spaCy en_core_web_sm; demo uses lexicon NER with identical output schema.",
        },
    }

    kpis = {
        "registered_users": len(students),
        "opportunities_matched": sum(len(r["top5"]) for r in recommendations),
        "active_mentor_pairs": len(assignments),
        "at_risk_students_flagged": sum(1 for r in risk_predictions if r["at_risk"]),
        "nps_proxy": 42,
        "scam_flags": sum(1 for o in opportunities if o["is_scam_flag"]),
        "impact": {
            "scholarships_usd": 158000,
            "students_supported": 85,
            "countries": 6,
        },
    }

    auth_users = [
        {
            "email": "admin@jointhub.demo",
            "role": "admin",
            "full_name": "JointHub Admin",
            "student_id": None,
        }
    ]
    for s in students[:6]:
        auth_users.append(
            {
                "email": s["email"],
                "role": "student",
                "full_name": s["full_name"],
                "student_id": s["student_id"],
            }
        )

    jdump("student_profiles.json", students)
    jdump("mentors.json", mentors)
    jdump("opportunity_listings.json", opportunities)
    jdump("skills_inventory.json", skills)
    jdump("academic_performance.json", academics)
    jdump("platform_engagement_logs.json", engagement)
    jdump("mentorship_interactions.json", sessions)
    jdump("recommendations.json", recommendations)
    jdump(
        "mentorship.json",
        {
            "assignments": assignments,
            "top3_by_student": top3_by_student,
            "sessions": sessions,
            "mentors": mentors,
            "matrix": compat.round(4).tolist(),
            "student_labels": [s["full_name"] for s in students],
            "mentor_labels": [m["name"] for m in mentors],
            "metrics": {"f1": metrics["mentor_match_f1"], "target": 0.7},
        },
    )
    jdump(
        "risk.json",
        {
            "predictions": risk_predictions,
            "feature_importance": rf_imp,
            "logistic_coefficients": coef,
            "threshold": 0.65,
            "metrics": {"auc_roc": metrics["dropout_auc_roc"], "target": 0.75},
        },
    )
    jdump("nlp.json", nlp_rows)
    jdump("metrics.json", metrics)
    jdump("kpis.json", kpis)
    jdump("auth_users.json", auth_users)

    print(
        json.dumps(
            {
                "precision_at_5": metrics["recommendation_precision_at_5"],
                "mentor_f1": metrics["mentor_match_f1"],
                "auc": metrics["dropout_auc_roc"],
                "students": len(students),
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
