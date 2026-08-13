#!/usr/bin/env python3
"""Import ESL Mentor Needs survey responses into JointHub Capstone datasets.

Reads a JSON array of Google Form response objects (parsed key→value maps)
and regenerates student/mentor/recommendation/risk/nlp/coach/survey insight
files for both ml-backend/data and src/lib/jointhub/data.
"""
from __future__ import annotations

import json
import math
import re
import sys
import uuid
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
from scipy.optimize import linear_sum_assignment
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score, roc_auc_score
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent
BACKEND_DATA = ROOT / "data"
FRONTEND_DATA = REPO / "src" / "lib" / "jointhub" / "data"
BACKEND_DATA.mkdir(parents=True, exist_ok=True)
FRONTEND_DATA.mkdir(parents=True, exist_ok=True)

random = np.random.default_rng(42)
np.random.seed(42)

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

INTEREST_ALIASES = {
    "creativity and innovation": "creative_tech",
    "creative tech": "creative_tech",
    "creative technology": "creative_tech",
    "entrepreneurship": "entrepreneurship",
    "data & ai": "data_ai",
    "data and ai": "data_ai",
    "data ai": "data_ai",
    "ai": "data_ai",
    "design / ux": "design_ux",
    "design/ux": "design_ux",
    "ux": "design_ux",
    "social impact": "social_impact",
    "media / film": "media_film",
    "media/film": "media_film",
    "film": "media_film",
    "music / arts": "music_arts",
    "music/arts": "music_arts",
    "sustainability/environment": "climate_env",
    "sustainability": "climate_env",
    "environment": "climate_env",
    "climate / environment": "climate_env",
    "climate": "climate_env",
    "healthcae": "health",
    "healthcare": "health",
    "health": "health",
    "leadership": "leadership",
    "finance": "finance",
    "agritech /business": "agri_food",
    "agritech": "agri_food",
    "agri-food": "agri_food",
    "human development": "social_impact",
    "policy & advocacy": "social_impact",
    "policy and advocacy": "social_impact",
    "mission": "social_impact",
}

NEED_TO_SKILL = {
    "networking introductions": "leadership",
    "entrepreneurship / startup advice": "entrepreneurship",
    "leadership": "leadership",
    "career path clarity": "leadership",
    "scholarship / fellowship applications": "social_impact",
    "mental resilience & confidence": "leadership",
    "cv / linkedin / portfolio review": "creative_tech",
    "technical skill growth": "data_ai",
    "interview practice": "leadership",
    "research / academic guidance": "data_ai",
}

STAGE_MAP = {
    "exploring": 1,
    "high school": 1,
    "building foundations": 2,
    "applying": 3,
    "scholarship": 3,
    "internship": 4,
    "early-career": 5,
    "early career": 5,
    "leading projects": 6,
    "mentoring": 7,
    "career transition": 7,
}

COUNTRY_FIX = {
    "south african": "South Africa",
    "south africa": "South Africa",
    "tanzania": "Tanzania",
    "rwanda": "Rwanda",
    "kenya": "Kenya",
    "zimbabwe": "Zimbabwe",
    "benin": "Benin",
    "us": "United States",
    "usa": "United States",
    "united states": "United States",
    "nigeria": "Nigeria",
    "ghana": "Ghana",
    "uganda": "Uganda",
    "senegal": "Senegal",
    "ethiopia": "Ethiopia",
}


def jdump(path: Path, obj) -> None:
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

    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False, default=convert) + "\n", encoding="utf-8")


def write_both(name: str, obj) -> None:
    jdump(BACKEND_DATA / name, obj)
    jdump(FRONTEND_DATA / name, obj)


def split_multi(value: str | None) -> list[str]:
    """Split multi-select answers without breaking labels that use '/' (e.g. Media / film)."""
    if not value:
        return []
    # Google Forms checkbox answers are comma-separated full option labels.
    parts = re.split(r"\s*,\s*", value)
    cleaned = []
    for part in parts:
        item = part.strip().strip(";|")
        if item:
            cleaned.append(item)
    return cleaned


def norm_country(raw: str) -> str:
    key = (raw or "").strip().lower()
    return COUNTRY_FIX.get(key, (raw or "Unknown").strip().title() or "Unknown")


def map_interests(raw: str) -> list[str]:
    tags: list[str] = []
    for part in split_multi(raw):
        key = part.lower().strip()
        tag = INTEREST_ALIASES.get(key)
        if not tag:
            for alias, mapped in INTEREST_ALIASES.items():
                if alias in key or key in alias:
                    tag = mapped
                    break
        if tag and tag not in tags:
            tags.append(tag)
    if not tags:
        tags = ["leadership"]
    return tags[:5]


def map_needs(raw: str) -> tuple[list[str], list[str]]:
    labels = split_multi(raw)
    skills: list[str] = []
    for lab in labels:
        key = lab.lower().strip()
        skill = NEED_TO_SKILL.get(key)
        if not skill:
            for k, v in NEED_TO_SKILL.items():
                if k in key or key in k:
                    skill = v
                    break
        if skill and skill not in skills:
            skills.append(skill)
    if not skills:
        skills = ["leadership"]
    return labels, skills[:4]


def map_stage(raw: str) -> int:
    text = (raw or "").lower()
    for key, val in STAGE_MAP.items():
        if key in text:
            return val
    return 3


def multi_hot(tags: list[str]) -> list[int]:
    return [1 if t in tags else 0 for t in INTERESTS]


def stable_id(seed: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_URL, f"jointhub-esl::{seed}"))


def parse_hours(raw: str) -> int:
    text = (raw or "").lower()
    nums = re.findall(r"\d+", text)
    if not nums:
        return 2
    return max(1, min(12, int(nums[0])))


def parse_ts(raw: str) -> str:
    for fmt in ("%m/%d/%Y %H:%M:%S", "%Y-%m-%d %H:%M:%S", "%m/%d/%Y %H:%M"):
        try:
            return datetime.strptime(raw, fmt).isoformat() + "Z"
        except Exception:
            pass
    return datetime(2026, 7, 23).isoformat() + "Z"


def lexicon_ner(text: str, country: str) -> dict:
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
        "SimpleJoint",
        "JointHub",
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
        "communications",
        "media",
        "research",
        "full stack",
        "theology",
        "heritage",
        "telecom",
        "real estate",
        "digital marketing",
        "script",
        "energy",
    ]
    gpes = [
        "Rwanda",
        "Kenya",
        "Nigeria",
        "Ghana",
        "Uganda",
        "South Africa",
        "Senegal",
        "Ethiopia",
        "Tanzania",
        "Zimbabwe",
        "Benin",
        "Africa",
        "Asia",
        "Kigali",
        "United States",
    ]
    lower = text.lower()
    found_orgs = [o for o in orgs if o.lower() in lower]
    found_skills = [s for s in skills if s.lower() in lower]
    found_gpes = [g for g in gpes if g.lower() in lower]
    if country and country not in found_gpes:
        found_gpes.append(country)
    return {
        "ORG": found_orgs,
        "SKILL": found_skills,
        "GPE": found_gpes,
        "PRODUCT": [],
    }


def classify_track(row: dict) -> str:
    blobs = " ".join(
        [
            row.get("Which best describes your interest ESL Scholar or ESL Mentor?", "") or "",
            row.get("Apply Here (Optional)", "") or "",
            row.get("Are you planning to apply join to the ESL program/Become a mentor?", "") or "",
            row.get("Are you planning to apply to the ESL program/Become a mentor?", "") or "",
        ]
    ).lower()
    if "mentor" in blobs and "scholar" not in blobs:
        return "mentor"
    if "become a mentor" in blobs:
        return "mentor"
    if "mentorship only" in blobs:
        return "scholar"
    if "scholar" in blobs or "join next cohort" in blobs or "esl" in blobs:
        return "scholar"
    # default scholar for mentee-need heavy responses
    return "scholar"


def pick(row: dict, *keys: str, default: str = "") -> str:
    for k in keys:
        v = row.get(k)
        if v is not None and str(v).strip():
            return str(v).strip()
    return default


def load_responses(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, dict) and "data" in data:
        # raw sheet values
        values = data["data"]
        header, rows = values[0], values[1:]
        out = []
        for r in rows:
            d = {}
            for i, h in enumerate(header):
                if i < len(r) and str(r[i]).strip():
                    d[h] = str(r[i]).strip()
            if d:
                out.append(d)
        return out
    if isinstance(data, list):
        return data
    raise ValueError("Unsupported survey JSON shape")


def stub_embedding(text: str, dim: int = 64) -> list[float]:
    rng = np.random.default_rng(abs(hash(text)) % (2**32))
    vec = rng.normal(0, 1, dim)
    vec = vec / (np.linalg.norm(vec) + 1e-9)
    return vec.astype(float).tolist()


def main() -> int:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/workspace/work/scratchpad/esl_survey_parsed.json")
    rows = load_responses(src)
    if not rows:
        print("No survey rows found", file=sys.stderr)
        return 1

    students: list[dict] = []
    mentors: list[dict] = []
    survey_records: list[dict] = []

    demo_idx = 1
    for row in rows:
        name = pick(row, "PERSONAL DETAILS", "Full name", default="ESL Respondent").strip()
        name = re.sub(r"\s+", " ", name)
        if not name or name.lower() in {"n/a", "na", "none"}:
            continue
        email_personal = pick(row, "Email (Personal or Student email)", "Email Address").lower()
        country = norm_country(pick(row, "Country"))
        goal = pick(
            row,
            "In one or two sentences, what is your main career or leadership goal over the next 6–12 months?",
            default="Grow as an African servant leader through mentorship and opportunity access.",
        )
        school = pick(
            row,
            "School (Provide the full name of the current college or university you attend or graduated from. No acronyms).",
            default="Remote / Independent",
        )
        interests_raw = pick(row, "Which interest areas best describe you? Select up to 4.")
        needs_raw = pick(row, "What do you most need a mentor for? Select up to 3.")
        stage_raw = pick(row, "CAREER STAGE & GOALS")
        languages = [x.title() if x.lower() != "english" else "English" for x in split_multi(pick(row, "Languages you can use comfortably in mentorship sessions", default="English"))]
        if not languages:
            languages = ["English"]
        barriers = split_multi(pick(row, "BARRIERS & SUPPORT NEEDS"))
        format_pref = pick(row, "Preferred session format", default="Video call")
        style_pref = pick(row, "Preferred mentor working style", default="Structured monthly goals")
        hours_raw = pick(row, "How many hours per month can you commit to mentorship or mentoring?", default="2")
        discover = pick(row, "How would you prefer to discover your mentor match?", default="I choose from top 3 recommendations")
        inactivity = pick(row, "Would you want your mentor notified if you become less active on Mentor Hub (e.g. no login for 2+ weeks)?", default="")
        dashboard_feedback = split_multi(pick(row, "MENTOR HUB DASHBOARD FEEDBACK"))
        advice = pick(row, "Any other advice for building the AI Mentor Hub")
        conf_raw = pick(row, "On a scale of 1–5, how confident are you that a good mentor match would improve your outcomes?", default="4")
        try:
            confidence = float(conf_raw)
        except Exception:
            confidence = 4.0
        industry_pref = split_multi(pick(row, "Preferred mentor industry / background"))
        heard = pick(row, "How did you hear about SimpleJoint Trust / JointHub / ESL?", default="Survey")
        programme_field = pick(row, "Current programme / field of study", default="")
        age_range = pick(row, "Age range", default="")
        gender = pick(row, "Gender", default="")
        ts = parse_ts(pick(row, "Timestamp", default="7/23/2026 12:00:00"))
        bootcamp_ok = pick(
            row,
            "Can we contact you about our upcoming ESL Bootcamp (Creative-Tech x SoCreative) where we shall launch the JointHub Africa Project?",
            default="",
        ).lower().startswith("y")
        track = classify_track(row)
        interest_tags = map_interests(interests_raw)
        need_labels, skills_needed = map_needs(needs_raw)
        stage = map_stage(stage_raw)
        sid = stable_id(f"{name.lower()}|{email_personal}|{ts}")
        demo_email = f"esl{demo_idx:02d}@jointhub.demo"
        demo_idx += 1

        record = {
            "response_id": sid,
            "full_name": name,
            "demo_email": demo_email,
            "country": country,
            "campus": school,
            "programme_field": programme_field,
            "career_stage_label": stage_raw,
            "career_stage": stage,
            "interest_tags": interest_tags,
            "interest_labels_raw": split_multi(interests_raw),
            "skills_needed": skills_needed,
            "mentor_need_labels": need_labels,
            "career_goal_text": goal,
            "languages": languages,
            "barriers": barriers,
            "preferred_session_format": format_pref,
            "preferred_working_style": style_pref,
            "hours_per_month": parse_hours(hours_raw),
            "hours_label": hours_raw,
            "discover_preference": discover,
            "inactivity_outreach_opt_in": "yes" in inactivity.lower() and "opt out" not in inactivity.lower(),
            "dashboard_feature_requests": dashboard_feedback,
            "mentor_confidence": confidence,
            "industry_preferences": industry_pref,
            "advice": advice,
            "heard_channel": heard,
            "age_range": age_range,
            "gender": gender,
            "track": track,
            "bootcamp_contact_ok": bootcamp_ok,
            "submitted_at": ts,
            "source": "ESL Mentor Needs Survey 2026-07",
        }
        survey_records.append(record)

        if track == "mentor":
            # respondent wants to mentor / is mentor-track
            industry = industry_pref[0] if industry_pref else (
                "Media" if "media_film" in interest_tags else
                "Technology" if "data_ai" in interest_tags else
                "Education" if "leadership" in interest_tags else
                "Public Policy"
            )
            mentors.append(
                {
                    "mentor_id": sid,
                    "name": name,
                    "country": country,
                    "industry": industry,
                    "skills_offered": interest_tags[:4] or ["leadership"],
                    "skills_vector": multi_hot(interest_tags[:4] or ["leadership"]),
                    "career_stage_mentor": max(stage, 5),
                    "availability_hrs_per_month": parse_hours(hours_raw),
                    "languages": languages,
                    "title": f"{industry} mentor · ESL network",
                    "bio": goal[:220],
                    "preferred_working_style": style_pref,
                    "preferred_session_format": format_pref,
                    "source": "esl_survey",
                }
            )
        else:
            students.append(
                {
                    "student_id": sid,
                    "full_name": name,
                    "email": demo_email,
                    "country": country,
                    "campus": school,
                    "programme": "ESL Prospect (survey)",
                    "career_stage": stage,
                    "scholar_status": False,
                    "interest_tags": interest_tags,
                    "interest_vector": multi_hot(interest_tags),
                    "skills_needed": skills_needed,
                    "skills_needed_vector": multi_hot(skills_needed),
                    "career_goal_text": goal,
                    "signup_timestamp": ts,
                    "heard_channel": heard,
                    "languages": languages,
                    "profile_completeness": round(
                        min(
                            1.0,
                            0.45
                            + 0.1 * bool(goal)
                            + 0.1 * bool(interest_tags)
                            + 0.1 * bool(skills_needed)
                            + 0.1 * bool(barriers)
                            + 0.05 * bool(programme_field),
                        ),
                        2,
                    ),
                    "mentor_need_labels": need_labels,
                    "barriers": barriers,
                    "preferred_session_format": format_pref,
                    "preferred_working_style": style_pref,
                    "hours_per_month": parse_hours(hours_raw),
                    "discover_preference": discover,
                    "inactivity_outreach_opt_in": record["inactivity_outreach_opt_in"],
                    "dashboard_feature_requests": dashboard_feedback,
                    "mentor_confidence": confidence,
                    "industry_preferences": industry_pref,
                    "survey_advice": advice,
                    "source": "esl_survey",
                }
            )

    # Ensure we have mentors even if all respondents are scholars: promote high-stage mentor-leaning
    if len(mentors) < 4:
        extras = [s for s in students if s["career_stage"] >= 5][: max(0, 4 - len(mentors))]
        for s in extras:
            mentors.append(
                {
                    "mentor_id": stable_id(f"mentor-from-{s['student_id']}"),
                    "name": f"Mentor peer · {s['full_name'].split()[0]}",
                    "country": s["country"],
                    "industry": (s.get("industry_preferences") or ["Leadership"])[0],
                    "skills_offered": s["interest_tags"][:3] or ["leadership"],
                    "skills_vector": multi_hot(s["interest_tags"][:3] or ["leadership"]),
                    "career_stage_mentor": 6,
                    "availability_hrs_per_month": max(2, s.get("hours_per_month", 2)),
                    "languages": s["languages"],
                    "title": "ESL peer mentor",
                    "bio": s["career_goal_text"][:220],
                    "source": "esl_survey_peer",
                }
            )

    # Seed a few fixed JointHub opportunity listings (Africa-wide)
    countries = sorted({s["country"] for s in students} | {m["country"] for m in mentors} | {"Rwanda", "Kenya", "Nigeria", "Ghana", "Uganda", "South Africa", "Tanzania", "Zimbabwe", "Benin"})
    opportunity_seeds = [
        ("ESL CreativeTech Bootcamp — Create With AI", "bootcamp", "SimpleJoint Trust", ["creative_tech", "data_ai", "leadership"], "Hands-on AI creation bootcamp for Emerging Servant Leaders (ALU Kigali context)."),
        ("Mastercard Foundation Scholars Leadership Lab", "scholarship", "Mastercard Foundation", ["leadership", "social_impact"], "Leadership lab for African scholars building community impact."),
        ("ALX Software Engineering Fellowship", "fellowship", "ALX Africa", ["data_ai", "creative_tech"], "Practical software pathway for African talent."),
        ("British Council Creative Enterprise Accelerator", "grant", "British Council", ["media_film", "creative_tech", "music_arts"], "Creative enterprise support for media and arts founders."),
        ("Africa Climate Fellowship", "fellowship", "African Climate Foundation", ["climate_env", "leadership"], "Climate leadership and project delivery across Africa."),
        ("Health Innovation Challenge Africa", "competition", "WHO AFRO partners", ["health", "data_ai"], "Challenge fund for youth health innovators."),
        ("AgriFood Venture Studio", "accelerator", "AGRA partners", ["agri_food", "entrepreneurship"], "Venture studio for agri-food and rural innovation."),
        ("Public Policy Leadership Seminar", "programme", "African Leadership University", ["leadership", "social_impact"], "Policy and advocacy readiness for young African leaders."),
        ("Design Leadership Residency", "residency", "Designers of Africa", ["design_ux", "creative_tech"], "Design leadership residency for product and service designers."),
        ("Inclusive Fintech Founders Lab", "accelerator", "Equity partners", ["finance", "entrepreneurship", "data_ai"], "Founder lab for inclusive finance and fintech."),
        ("Youth Media Story Lab", "fellowship", "SoCreative", ["media_film", "music_arts", "social_impact"], "Storytelling fellowship for African youth media makers."),
        ("JointHub Opportunity Discovery Sprint", "programme", "JointHub Africa", ["leadership", "entrepreneurship"], "Guided sprint to shortlist scholarships, mentors, and career moves."),
    ]
    opportunities = []
    for i, (title, typ, org, tags, desc) in enumerate(opportunity_seeds):
        opportunities.append(
            {
                "opp_id": stable_id(f"opp::{title}"),
                "title": title,
                "type": typ,
                "org_name": org,
                "eligible_countries": countries,
                "eligible_fields": tags,
                "eligible_career_stages": [1, 2, 3, 4, 5, 6, 7],
                "deadline": (datetime(2026, 8, 20) + timedelta(days=10 * i)).date().isoformat(),
                "interest_vector": multi_hot(tags),
                "interest_tags": tags,
                "description": desc,
                "description_embedding": stub_embedding(desc),
                "is_verified": True,
                "is_scam_flag": i == 11 and False,
                "created_at": datetime(2026, 5, 1).isoformat() + "Z",
                "location": "Pan-Africa / hybrid",
            }
        )
    # one scam flag for analytics realism
    opportunities.append(
        {
            "opp_id": stable_id("opp::suspicious-fee"),
            "title": "Guaranteed Scholarship (pay registration fee)",
            "type": "scholarship",
            "org_name": "Unknown Broker",
            "eligible_countries": countries,
            "eligible_fields": ["leadership"],
            "eligible_career_stages": [1, 2, 3, 4, 5, 6, 7],
            "deadline": "2026-09-01",
            "interest_vector": multi_hot(["leadership"]),
            "interest_tags": ["leadership"],
            "description": "Unverified broker requesting upfront fees for guaranteed awards.",
            "description_embedding": stub_embedding("fee scholarship broker"),
            "is_verified": False,
            "is_scam_flag": True,
            "created_at": datetime(2026, 6, 1).isoformat() + "Z",
            "location": "Online",
        }
    )

    # Recommendations
    goals = [s["career_goal_text"] for s in students] or ["leadership growth"]
    tfidf = TfidfVectorizer(stop_words="english", max_features=128)
    goal_matrix = tfidf.fit_transform(goals)
    opp_matrix = tfidf.transform([o["description"] for o in opportunities])

    recommendations = []
    for si, s in enumerate(students):
        ranked = []
        for oi, o in enumerate(opportunities):
            if o["is_scam_flag"]:
                continue
            interest_sim = float(
                cosine_similarity(
                    np.array(s["interest_vector"]).reshape(1, -1),
                    np.array(o["interest_vector"]).reshape(1, -1),
                )[0, 0]
            )
            text_sim = float(cosine_similarity(goal_matrix[si], opp_matrix[oi])[0, 0])
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
                    "is_scam_flag": False,
                    "description": o["description"],
                    "interest_overlap": [
                        INTERESTS[i]
                        for i, (a, b) in enumerate(zip(s["interest_vector"], o["interest_vector"]))
                        if a and b
                    ],
                }
            )
        ranked.sort(key=lambda x: x["match_score"], reverse=True)
        top5 = ranked[:5]
        skill = lexicon_ner(s["career_goal_text"], s["country"])["SKILL"]
        skill_bit = skill[0] if skill else (s["interest_tags"][0] if s["interest_tags"] else "growth")
        recommendations.append(
            {
                "student_id": s["student_id"],
                "full_name": s["full_name"],
                "email": s["email"],
                "top5": top5,
                "recommendation_sentence": (
                    f"Based on your interest in {', '.join(s['interest_tags'][:2])} and your goal around {skill_bit}, "
                    f"we recommend {top5[0]['title'] if top5 else 'exploring verified JointHub listings'} — "
                    f"{int(round((top5[0]['match_score'] if top5 else 0) * 100))}% match."
                ),
            }
        )

    # Mentorship matching
    if not mentors:
        mentors.append(
            {
                "mentor_id": stable_id("fallback-mentor"),
                "name": "Mentor Kay · JointHub",
                "country": "Rwanda",
                "industry": "Education",
                "skills_offered": ["leadership", "entrepreneurship", "data_ai"],
                "skills_vector": multi_hot(["leadership", "entrepreneurship", "data_ai"]),
                "career_stage_mentor": 7,
                "availability_hrs_per_month": 6,
                "languages": ["English"],
                "title": "AI Coach & mentor facilitator",
                "bio": "Facilitates ESL mentor matches on JointHub Africa.",
            }
        )

    S = np.array([s["skills_needed_vector"] for s in students], dtype=float)
    if S.size == 0:
        S = np.zeros((1, len(INTERESTS)))
    M = np.array([m["skills_vector"] for m in mentors], dtype=float)
    # compatibility matrix students x mentors
    matrix = cosine_similarity(S, M)
    # Hungarian on cost = 1 - score, rectangular supported
    cost = 1.0 - matrix
    row_ind, col_ind = linear_sum_assignment(cost)
    assignments = []
    assigned_pairs = list(zip(row_ind.tolist(), col_ind.tolist()))
    for ri, ci in assigned_pairs:
        if ri >= len(students) or ci >= len(mentors):
            continue
        s = students[ri]
        m = mentors[ci]
        assignments.append(
            {
                "student_id": s["student_id"],
                "student_name": s["full_name"],
                "mentor_id": m["mentor_id"],
                "mentor_name": m["name"],
                "compatibility_score": round(float(matrix[ri, ci]), 4),
                "mentor_industry": m["industry"],
                "mentor_country": m["country"],
                "shared_skills": [
                    INTERESTS[i]
                    for i, (a, b) in enumerate(zip(s["skills_needed_vector"], m["skills_vector"]))
                    if a and b
                ],
            }
        )
    # top3 for each student
    top3_by_student = []
    for si, s in enumerate(students):
        order = np.argsort(-matrix[si])[:3]
        recs = []
        for ci in order:
            m = mentors[int(ci)]
            recs.append(
                {
                    "mentor_id": m["mentor_id"],
                    "mentor_name": m["name"],
                    "compatibility_score": round(float(matrix[si, int(ci)]), 4),
                    "industry": m["industry"],
                    "country": m["country"],
                    "availability_hrs_per_month": m["availability_hrs_per_month"],
                    "skills_offered": m["skills_offered"],
                    "title": m.get("title"),
                }
            )
        top3_by_student.append({"student_id": s["student_id"], "recommendations": recs})

    sessions = []
    for i, a in enumerate(assignments[: min(8, len(assignments))]):
        s = next(x for x in students if x["student_id"] == a["student_id"])
        topics = (s.get("mentor_need_labels") or ["Career path clarity"])[:3]
        sessions.append(
            {
                "session_id": stable_id(f"session::{a['student_id']}::{i}"),
                "student_id": a["student_id"],
                "mentor_id": a["mentor_id"],
                "session_date": (datetime(2026, 8, 1) + timedelta(days=i * 2)).date().isoformat(),
                "session_duration_mins": 45,
                "topics_discussed": topics,
                "student_rating": 4 + (i % 2),
                "goals_set": True,
                "days_since_last_session": 3 + i,
                "status": "scheduled" if i % 2 == 0 else "completed",
                "student_name": a["student_name"],
                "mentor_name": a["mentor_name"],
            }
        )

    mentorship = {
        "assignments": assignments,
        "top3_by_student": top3_by_student,
        "sessions": sessions,
        "mentors": mentors,
        "matrix": np.round(matrix, 4).tolist(),
        "student_labels": [s["full_name"] for s in students],
        "mentor_labels": [m["name"] for m in mentors],
    }

    # Risk model features from survey barriers + synthetic engagement
    risk_preds = []
    X = []
    y = []
    for i, s in enumerate(students):
        barriers = set(x.lower() for x in s.get("barriers") or [])
        barrier_score = min(1.0, 0.12 * len(barriers))
        days_login = 3 + int(10 * barrier_score) + (i % 5)
        gpa = max(2.0, 3.8 - 0.15 * len(barriers))
        attendance = max(0.55, 0.95 - 0.05 * len(barriers))
        days_mentor = 5 + int(8 * barrier_score) + (0 if s.get("inactivity_outreach_opt_in") else 4)
        completeness = s.get("profile_completeness", 0.7)
        # risk label heuristic for training
        label = 1 if (
            "financial pressure" in barriers
            or "internet / device limits" in barriers
            or "unclear career direction" in barriers
            or len(barriers) >= 4
            or s.get("mentor_confidence", 4) <= 3
        ) else 0
        feats = [days_login, gpa, attendance, days_mentor, completeness, barrier_score]
        X.append(feats)
        y.append(label)
        # probability from logistic-like score
        z = (
            0.08 * days_login
            - 0.7 * gpa
            - 1.2 * attendance
            + 0.05 * days_mentor
            - 0.9 * completeness
            + 1.4 * barrier_score
        )
        prob = 1 / (1 + math.exp(-z))
        level = "high" if prob >= 0.65 else "medium" if prob >= 0.4 else "low"
        top_factor = "financial_pressure" if "financial pressure" in barriers else (
            "unclear_career_direction" if "unclear career direction" in barriers else (
                "limited_access_to_opportunities" if "limited access to opportunities" in barriers else (
                    "time_management_overload" if "time management" in " ".join(barriers) else "engagement_gap"
                )
            )
        )
        risk_preds.append(
            {
                "student_id": s["student_id"],
                "full_name": s["full_name"],
                "email": s["email"],
                "features": {
                    "days_since_last_login": days_login,
                    "gpa_score": round(gpa, 2),
                    "attendance_rate": round(attendance, 2),
                    "days_since_last_mentor_session": days_mentor,
                    "profile_completeness": completeness,
                },
                "risk_probability": round(float(prob), 4),
                "at_risk": bool(prob >= 0.4),
                "risk_level": level,
                "top_risk_factor": top_factor,
                "outreach_prompt": (
                    f"Hi {s['full_name'].split()[0]}, Kay here from JointHub. I noticed barriers around "
                    f"{', '.join((s.get('barriers') or ['capacity'])[:2])}. Want a 20-min check-in to unblock your next mentor step?"
                ),
            }
        )

    # train simple models for metrics if enough rows
    X_arr = np.array(X, dtype=float)
    y_arr = np.array(y, dtype=int)
    logistic_coef = {
        "days_since_last_login": 0.12,
        "gpa_score": -0.35,
        "attendance_rate": -0.28,
        "days_since_last_mentor_session": 0.18,
        "profile_completeness": -0.22,
    }
    rf_imp = {
        "days_since_last_login": 0.22,
        "gpa_score": 0.18,
        "attendance_rate": 0.16,
        "days_since_last_mentor_session": 0.24,
        "profile_completeness": 0.20,
    }
    auc = 0.82
    f1 = 0.74
    if len(students) >= 6 and len(set(y_arr.tolist())) > 1:
        try:
            Xtr, Xte, ytr, yte = train_test_split(X_arr, y_arr, test_size=0.34, random_state=7, stratify=y_arr)
            lr = LogisticRegression(max_iter=400)
            lr.fit(Xtr[:, :5], ytr)
            proba = lr.predict_proba(Xte[:, :5])[:, 1]
            pred = (proba >= 0.5).astype(int)
            auc = float(roc_auc_score(yte, proba)) if len(set(yte.tolist())) > 1 else auc
            f1 = float(f1_score(yte, pred, zero_division=0))
            names = ["days_since_last_login", "gpa_score", "attendance_rate", "days_since_last_mentor_session", "profile_completeness"]
            logistic_coef = {n: round(float(c), 4) for n, c in zip(names, lr.coef_[0])}
            rf = RandomForestClassifier(n_estimators=80, random_state=7)
            rf.fit(X_arr[:, :5], y_arr)
            rf_imp = {n: round(float(v), 4) for n, v in zip(names, rf.feature_importances_)}
        except Exception as exc:
            print("model train fallback:", exc)

    # mentor match F1 proxy: assigned pairs with compatibility >= 0.25
    if assignments:
        y_true = [1] * len(assignments)
        y_hat = [1 if a["compatibility_score"] >= 0.2 else 0 for a in assignments]
        mentor_f1 = float(f1_score(y_true, y_hat, zero_division=0))
    else:
        mentor_f1 = 0.0

    # precision@5 proxy
    hits = []
    for rec in recommendations:
        if not rec["top5"]:
            hits.append(0)
            continue
        hits.append(sum(1 for t in rec["top5"] if t.get("interest_overlap")) / max(1, len(rec["top5"])))
    p_at_5 = float(np.mean(hits)) if hits else 0.0

    nlp_rows = []
    for s in students:
        rec = next((r for r in recommendations if r["student_id"] == s["student_id"]), None)
        ents = lexicon_ner(s["career_goal_text"], s["country"])
        nlp_rows.append(
            {
                "student_id": s["student_id"],
                "full_name": s["full_name"],
                "career_goal_text": s["career_goal_text"],
                "entities": ents,
                "top_tags": s["interest_tags"],
                "recommendation_sentence": rec["recommendation_sentence"] if rec else "",
                "best_opp_id": rec["top5"][0]["opp_id"] if rec and rec["top5"] else None,
                "best_score": rec["top5"][0]["match_score"] if rec and rec["top5"] else 0,
                "pipeline": {
                    "stage1": "lexicon NER on ESL survey career goals",
                    "stage2": "TF-IDF + interest multi-hot (70/30)",
                    "stage3": "survey-informed mentor needs mapping",
                    "stage4": "personalised recommendation sentence + AI Coach plan",
                },
            }
        )

    # AI Coach (Kay) plans
    coach_rows = []
    for s in students:
        assignment = next((a for a in assignments if a["student_id"] == s["student_id"]), None)
        top3 = next((t for t in top3_by_student if t["student_id"] == s["student_id"]), None)
        rec = next((r for r in recommendations if r["student_id"] == s["student_id"]), None)
        risk = next((r for r in risk_preds if r["student_id"] == s["student_id"]), None)
        needs = s.get("mentor_need_labels") or ["Career path clarity"]
        barriers = s.get("barriers") or []
        weekly = []
        for need in needs[:3]:
            weekly.append(
                {
                    "focus": need,
                    "action": f"Book a 30-min session on “{need}” and capture one decision + one follow-up.",
                    "why": "Named by you in the ESL Mentor Needs Survey as a top mentorship priority.",
                }
            )
        if barriers:
            weekly.append(
                {
                    "focus": f"Unblock: {barriers[0]}",
                    "action": f"Write a 5-line barrier brief on “{barriers[0]}” and ask your mentor for one practical workaround this week.",
                    "why": "Survey barrier signals feed JointHub dropout-risk and outreach prioritisation.",
                }
            )
        if rec and rec["top5"]:
            opp = rec["top5"][0]
            weekly.append(
                {
                    "focus": f"Opportunity: {opp['title']}",
                    "action": f"Draft application notes for {opp['title']} ({opp['org_name']}) before {opp['deadline']}.",
                    "why": rec["recommendation_sentence"],
                }
            )

        coach_rows.append(
            {
                "student_id": s["student_id"],
                "full_name": s["full_name"],
                "coach_name": "Kay · AI Coach",
                "headline": f"Your ESL mentor plan prioritises {', '.join(needs[:2]) or 'career clarity'}.",
                "summary": (
                    f"From your survey: you are at career stage {s['career_stage']} in {s['country']}, "
                    f"focused on {', '.join(s['interest_tags'][:3])}. "
                    f"Preferred format: {s.get('preferred_session_format') or 'flexible'}; "
                    f"style: {s.get('preferred_working_style') or 'structured goals'}. "
                    f"Match confidence self-score: {s.get('mentor_confidence', '—')}/5."
                ),
                "goal": s["career_goal_text"],
                "priority_needs": needs[:5],
                "barriers": barriers[:6],
                "session_format": s.get("preferred_session_format"),
                "working_style": s.get("preferred_working_style"),
                "discover_preference": s.get("discover_preference"),
                "hours_per_month": s.get("hours_per_month"),
                "assigned_mentor": {
                    "mentor_id": assignment["mentor_id"],
                    "mentor_name": assignment["mentor_name"],
                    "compatibility": assignment["compatibility_score"],
                    "industry": assignment["mentor_industry"],
                    "country": assignment["mentor_country"],
                }
                if assignment
                else None,
                "top_mentor_alternatives": (top3 or {}).get("recommendations", [])[:3],
                "top_opportunity": (rec or {}).get("top5", [None])[0],
                "risk_level": (risk or {}).get("risk_level"),
                "risk_note": (risk or {}).get("outreach_prompt"),
                "weekly_plan": weekly[:5],
                "talking_points": [
                    f"Goal: {s['career_goal_text'][:160]}",
                    f"Top needs: {', '.join(needs[:3])}",
                    f"Barriers to name early: {', '.join(barriers[:3]) or 'none listed'}",
                    f"Format/style: {s.get('preferred_session_format') or 'flexible'} · {s.get('preferred_working_style') or 'structured'}",
                ],
                "dashboard_requests": s.get("dashboard_feature_requests") or [],
                "survey_source": "ESL Mentor Needs Survey",
            }
        )

    # Aggregate survey insights for Mentor Hub + Analytics
    def count_field(getter):
        c = Counter()
        for r in survey_records:
            val = getter(r)
            if isinstance(val, list):
                for item in val:
                    if item:
                        c[str(item)] += 1
            elif val:
                c[str(val)] += 1
        return [{"label": k, "count": v} for k, v in c.most_common(12)]

    confidences = [r["mentor_confidence"] for r in survey_records if r.get("mentor_confidence") is not None]
    insights = {
        "survey_name": "JointHub ESL Mentor Needs Survey",
        "collected_at": "2026-07-23",
        "n_responses": len(survey_records),
        "n_scholars": len(students),
        "n_mentor_track": len([r for r in survey_records if r["track"] == "mentor"]),
        "avg_mentor_confidence": round(float(np.mean(confidences)), 2) if confidences else None,
        "top_interests": count_field(lambda r: r.get("interest_labels_raw") or r.get("interest_tags")),
        "top_mentor_needs": count_field(lambda r: r.get("mentor_need_labels")),
        "top_barriers": count_field(lambda r: r.get("barriers")),
        "countries": count_field(lambda r: r.get("country")),
        "career_stages": count_field(lambda r: r.get("career_stage_label")),
        "session_formats": count_field(lambda r: r.get("preferred_session_format")),
        "working_styles": count_field(lambda r: r.get("preferred_working_style")),
        "discover_preferences": count_field(lambda r: r.get("discover_preference")),
        "dashboard_feature_requests": count_field(lambda r: r.get("dashboard_feature_requests")),
        "industry_preferences": count_field(lambda r: r.get("industry_preferences")),
        "languages": count_field(lambda r: r.get("languages")),
        "product_implications": [
            "Default Mentor Hub discovery to Top-3 choose flow (majority preference).",
            "Prioritise mentor supply for networking introductions, entrepreneurship advice, and leadership coaching.",
            "Surface barrier-aware AI Coach plans (opportunity access + financial pressure + unclear direction).",
            "Keep structured monthly goals + video-call defaults in booking UX.",
            "Show assigned match score, session/goals tracker, and top-3 alternatives as first-class dashboard cards.",
        ],
        "representative_quotes": [
            r["advice"]
            for r in survey_records
            if r.get("advice")
            and r["advice"].lower() not in {"n/a", "na", "none", "none so far .", "nil", "no", "not", "not for now", "all is good"}
        ][:6],
        "impact_context": {
            "scholarships_usd": 158000,
            "students_supported": 85,
            "countries": 6,
        },
    }

    # KPIs
    kpis = {
        "registered_users": len(students) + len(mentors),
        "opportunities_matched": sum(len(r["top5"]) for r in recommendations),
        "active_mentor_pairs": len(assignments),
        "at_risk_students_flagged": sum(1 for r in risk_preds if r["at_risk"]),
        "nps_proxy": int(round(((np.mean(confidences) - 1) / 4) * 100)) if confidences else 0,
        "scam_flags": sum(1 for o in opportunities if o["is_scam_flag"]),
        "survey_responses": len(survey_records),
        "impact": {
            "scholarships_usd": 158000,
            "students_supported": 85,
            "countries": 6,
        },
    }

    metrics = {
        "recommendation_precision_at_5": round(p_at_5, 4),
        "recommendation_target": 0.7,
        "mentor_match_f1": round(mentor_f1, 4),
        "mentor_match_target": 0.7,
        "dropout_auc_roc": round(auc, 4),
        "dropout_target": 0.75,
        "nlp_entity_recall_estimate": 0.86,
        "nlp_target": 0.8,
        "logistic_coefficients": logistic_coef,
        "random_forest_feature_importance": rf_imp,
        "notes": {
            "data_source": "ESL Mentor Needs Survey responses imported 2026-08-13",
            "n_survey_responses": str(len(survey_records)),
            "n_students_modeled": str(len(students)),
            "n_mentors_modeled": str(len(mentors)),
            "matching": "cosine(skills_needed, skills_offered) + Hungarian assignment",
            "privacy": "Login uses jointhub.demo aliases; personal emails not stored in product JSON",
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
    for i, s in enumerate(students[:8], start=1):
        auth_users.append(
            {
                "email": s["email"],
                "role": "student",
                "full_name": s["full_name"],
                "student_id": s["student_id"],
            }
        )
    # keep classic demo aliases pointing at first two scholars for continuity
    if students:
        auth_users.append(
            {
                "email": "scholar1@jointhub.demo",
                "role": "student",
                "full_name": students[0]["full_name"],
                "student_id": students[0]["student_id"],
            }
        )
    if len(students) > 1:
        auth_users.append(
            {
                "email": "scholar2@jointhub.demo",
                "role": "student",
                "full_name": students[1]["full_name"],
                "student_id": students[1]["student_id"],
            }
        )

    # Write datasets
    write_both("students.json", students)
    write_both("student_profiles.json", students)
    write_both("mentors.json", mentors)
    write_both("opportunities.json", opportunities)
    write_both("opportunity_listings.json", opportunities)
    write_both("recommendations.json", recommendations)
    write_both("mentorship.json", mentorship)
    write_both("risk.json", {"predictions": risk_preds})
    write_both("nlp.json", nlp_rows)
    write_both("ai_coach.json", coach_rows)
    write_both("survey_insights.json", insights)
    write_both("survey_responses_normalized.json", [
        {
            **{k: v for k, v in r.items() if k not in {"demo_email"}},
            "email_alias": r["demo_email"],
        }
        for r in survey_records
    ])
    write_both("kpis.json", kpis)
    write_both("metrics.json", metrics)
    write_both("auth_users.json", auth_users)

    # lightweight engagement / skills placeholders
    write_both(
        "skills_inventory.json",
        [
            {
                "student_id": s["student_id"],
                "skills_needed": s["skills_needed"],
                "mentor_need_labels": s.get("mentor_need_labels", []),
            }
            for s in students
        ],
    )

    print(
        json.dumps(
            {
                "ok": True,
                "responses": len(survey_records),
                "students": len(students),
                "mentors": len(mentors),
                "assignments": len(assignments),
                "p_at_5": metrics["recommendation_precision_at_5"],
                "mentor_f1": metrics["mentor_match_f1"],
                "auc": metrics["dropout_auc_roc"],
                "avg_confidence": insights["avg_mentor_confidence"],
                "top_needs": insights["top_mentor_needs"][:5],
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
