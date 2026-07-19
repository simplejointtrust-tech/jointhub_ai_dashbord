# JointHub Africa Capstone ML Backend

FastAPI companion service for Isaiah Kporon’s Capstone II (ALU EMBA 2026 — Data Science & AI).

## Modules

1. **Opportunity recommendation** — content-based cosine similarity over 12-dim interest vectors, hard filters for country and career stage, optional TF-IDF goal blend (30%).
2. **Mentor matching** — cosine compatibility matrix + Hungarian algorithm (`scipy.optimize.linear_sum_assignment`), top-3 alternatives per student.
3. **Dropout risk** — logistic regression primary score + Random Forest feature importance; flag when `P(at_risk) ≥ 0.65`.
4. **NLP pipeline** — NER (spaCy-compatible schema), TF-IDF enrichment, 384-d embedding stub (swap for `all-MiniLM-L6-v2`), personalised recommendation sentences.

## Run

```bash
cd ml-backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python scripts/generate_sample_data.py
uvicorn app.main:app --reload --port 8000
```

Key endpoints:

- `GET /health`
- `GET /meta`
- `POST /auth/login` `{ "email": "scholar1@jointhub.demo" }`
- `GET /opportunities/recommendations?student_id=...`
- `GET /mentorship/match`
- `GET /risk/predictions`
- `GET /nlp/goals`
- `GET /dashboard?email=scholar1@jointhub.demo`

## Data

Six Capstone schemas are generated as JSON under `data/`:

- `student_profiles` / `students.json`
- `skills_inventory.json`
- `academic_performance.json`
- `mentorship_interactions.json`
- `opportunity_listings.json`
- `platform_engagement_logs.json`

### Google Sheets interim source

Set:

- `JOINTHUB_GOOGLE_SERVICE_ACCOUNT_JSON` — path or raw service-account JSON
- `JOINTHUB_SHEETS_WORKBOOK_ID` — spreadsheet ID
- optional worksheet name overrides `JOINTHUB_SHEET_*`

See `app/sheets_loader.py`. Without credentials, the API uses sample JSON.

## Model notes for capstone report

- Precision@5, mentor F1, and AUC-ROC are computed in `scripts/generate_sample_data.py` and written to `data/metrics.json`.
- Offline demos use deterministic 384-d embedding stubs and lexicon NER so the stack runs without downloading spaCy/sentence-transformers weights.
- Production swap: install `spacy` + `en_core_web_sm` and `sentence-transformers`, then replace stub functions in the generator.

## Demo accounts

- `scholar1@jointhub.demo` — student view
- `scholar2@jointhub.demo` — student view
- `admin@jointhub.demo` — full cohort
