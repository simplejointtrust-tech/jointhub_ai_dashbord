# JointHub Africa — Capstone II AI Dashboard

Product app for **SimpleJoint Trust / JointHub Africa** Capstone II (Isaiah Kporon, ALU EMBA 2026 — Data Science & AI).

## Agent Quick Context

- Stack/framework: Next.js App Router, React 19, TypeScript, Tailwind CSS v4, TanStack Query, Supabase SSR scaffold, Bun.
- Package manager: Bun (`packageManager: bun@1.3.13`).
- Main scripts: `bun dev`, `bun run build`, `bun run lint`, `bun run typecheck`, `bun run test`.
- Product entrypoints:
  - `/` — JointHub Capstone landing
  - `/dashboard/login` — demo email gate
  - `/dashboard` — tabbed AI dashboard (Opportunities, Mentor Hub, Dropout risk, Analytics)
  - `/api/jointhub/*` — dashboard APIs over sample Capstone datasets
  - `ml-backend/` — FastAPI Python service implementing the same four ML modules
- Design tokens: Capstone palette Navy `#0D1B2A`, Teal `#028090`, Gold `#F4B942`, risk green/amber/red.
- Impact figures (always): **$158,000+ · 85+ students · 6+ countries**.
- Bootcamp: CreativeTech — Create With AI, **25–26 August 2026**, ALU Kigali.

## What shipped

Four live AI/DS modules on sample cohort data (not static mock cards):

1. Opportunity Recommendation Engine (cosine similarity, top 5)
2. Mentor-Mentee Matching (cosine + Hungarian assignment, heatmap, session log/booking)
3. Dropout Risk Prediction (logistic regression + RF importance, outreach trigger)
4. NLP Pipeline (NER schema, TF-IDF blend, personalised recommendation sentences)

## Demo path (Capstone)

1. Open `/dashboard/login`
2. Sign in as `esl02@jointhub.demo (Callie), esl03@jointhub.demo (Desmond), admin@jointhub.demo
3. Review **Opportunities** (“Curated for You”) and the NLP recommendation sentence
4. Open **Mentor Hub** for assigned mentor, top alternatives, matching matrix, session booking/log
5. Sign out and use `admin@jointhub.demo` for full **Dropout risk** table + outreach and **Analytics** KPIs

Demo accounts:

| Email | Role |
| --- | --- |
| scholar1@jointhub.demo | student |
| scholar2@jointhub.demo | student |
| admin@jointhub.demo | admin |

## Data integration

- **Dev / demo:** JSON under `src/lib/jointhub/data/` (mirrored from `ml-backend/data/`).
- **Regenerate:** `python ml-backend/scripts/generate_sample_data.py` then copy JSON into `src/lib/jointhub/data/`.
- **Interim Sheets:** `ml-backend/app/sheets_loader.py` + env vars documented in `ml-backend/README.md`.
- **Prod path:** managed Supabase / PostgreSQL (scaffold present; sample data used until real Sheets IDs and cohort exports are supplied).

### Six schemas

`student_profiles`, `skills_inventory`, `academic_performance`, `mentorship_interactions`, `opportunity_listings`, `platform_engagement_logs`.

## ML architecture (summary)

| Module | Algorithm | Target |
| --- | --- | --- |
| Opportunities | Cosine similarity + hard filters | Precision@5 ≥ 0.75 |
| Mentorship | Cosine matrix + Hungarian | F1 ≥ 0.70 |
| Dropout risk | Logistic regression (+ RF importance) | AUC-ROC ≥ 0.75 |
| NLP | NER + TF-IDF + 384-d semantic stub | Entity recall ≥ 0.80 |

Metrics for the current sample run live in `src/lib/jointhub/data/metrics.json` and the Analytics tab.

## Local run

```bash
bun install
bun dev
```

Optional Python API:

```bash
cd ml-backend
pip install -r requirements.txt
python scripts/generate_sample_data.py
uvicorn app.main:app --reload --port 8000
```

## Auth notes

- Capstone demo uses cookie email gate at `/dashboard/login` so judges can enter without production credentials.
- Supabase email/password scaffold remains at `/login` for production cutover.
- Do not publish production deploys without Isaiah’s sign-off.

## Secrets still needed from Isaiah

1. Google Sheets workbook ID for the six Capstone datasets
2. Google service-account JSON (read-only) if Sheets is the interim source
3. Historical Capstone I cohort CSV (anonymised) to retrain risk/matching on real labels
4. Confirmation of production domain mapping for `jointhub.simplejoint.org` vs managed app host
5. Any real mentor roster beyond sample mentors

## Partners / tags

British Council · ALX · Hood.D · A4 · JointHub Africa · ALU · @alueducation @millenniumfellows @UNAI

---

## External GitHub mirror

This package is the Capstone II AI dashboard export intended for:

`https://github.com/simplejointtrust-tech/jointhub_ai_dashbord`

See `PUSH_TO_GITHUB.md` and `EXPORT_MANIFEST.md` for source commit mapping and push steps.
