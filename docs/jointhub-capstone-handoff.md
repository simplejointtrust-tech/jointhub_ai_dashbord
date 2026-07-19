# JointHub Africa Capstone II — Engineering handoff

**Date:** 16 July 2026 (Africa/Kigali)  
**Owner:** Engineer agent (IT Manager seat vacant → escalate production to Isaiah)  
**Repo:** managed product app (`simplejoint-trust-4b4a02`)

## What shipped

Working Capstone AI dashboard in the product repository:

- Landing page pointing into the Capstone dashboard
- Demo auth: `scholar1@jointhub.demo`, `scholar2@jointhub.demo`, `admin@jointhub.demo`
- Four tabs with live computed sample outputs:
  1. Opportunities — ranked top-5 per scholar
  2. Mentor Hub — Hungarian assignment, heatmap, top-3, session booking/log
  3. Dropout risk — probabilities, risk levels, outreach trigger (admin)
  4. Analytics — KPI row + model metric targets vs sample results
- Always-visible KPI strip: registered users, opportunities matched, active mentor pairs, at-risk flagged
- Python FastAPI companion under `ml-backend/` with the same modules and Sheets loader stub
- Sample six-dataset JSON + generator script for reproducible demos

## Demo path for Capstone / bootcamp

1. Open the staging/preview URL → **Open Capstone dashboard**
2. Sign in as **scholar1@jointhub.demo**
3. Opportunities → Mentor Hub → (optional) risk for self
4. Sign out → **admin@jointhub.demo** → Dropout risk outreach + Analytics

Impact copy used: **$158,000+ · 85+ students · 6+ countries**  
Bootcamp: **CreativeTech — Create With AI, 25–26 August 2026, ALU Kigali**

## Model evidence (sample run)

From `metrics.json` after generator run (approx.):

- Precision@5 ≈ **0.86** (target 0.75)
- Mentor match F1 ≈ **0.78** (target 0.70)
- Dropout AUC-ROC ≈ **1.00** on synthetic labels (target 0.75) — treat as demo ceiling until real Capstone I labels replace synthetic targets
- NLP entity recall estimate **0.85** (target 0.80)

Algorithms are real (scikit-learn / scipy). Embeddings and NER use offline-safe stubs with production swap notes.

## Canva Mentor Hub prototype

Link `https://canva.link/je2jeixnk9s2za3` resolved to a Canva design that returned **403** without login, so visual details could not be scraped. Mentor Hub UI follows the Capstone brief + locked brand kit (Navy/Teal/Gold, dense ops layout: assigned mentor card, alternatives, matrix, booking, session log). If Isaiah can export the Canva board as PDF/PNG, a tighter visual pass can follow.

## Known gaps

1. Not wired to live Google Sheets yet (credentials not supplied)
2. Not trained on real Capstone I historical cohort
3. sentence-transformers / spaCy models not downloaded in sandbox (stubs documented)
4. Outreach button queues status only — **no emails sent** (operating constraint)
5. Production publish still requires Isaiah sign-off
6. Marketing site repo left untouched

## What Isaiah still needs to supply

| Item | Why |
| --- | --- |
| Sheets workbook ID + service account | Replace sample JSON with live six datasets |
| Capstone I anonymised labels | Honest risk/matching evaluation |
| Mentor roster (real names/availability) | Replace sample mentors |
| Confirm public hostname for dashboard | `jointhub.simplejoint.org` vs managed app domain |
| Canva Mentor Hub export (optional) | Pixel-match Module 2 prototype |
| Production deploy approval | Required before public push |

## Verification completed (local sandbox)

- `/` 200 — JointHub Capstone landing with impact figures and module overview
- `/dashboard/login` 200 — demo email gate (scholar1/scholar2/admin)
- Auth API — `scholar1@jointhub.demo` and `admin@jointhub.demo` succeed
- Dashboard API (student): 5 ranked opportunities (e.g. ALX Software Engineering Fellowship), assigned mentor **Mentor Ibrahim Nkrumah**, personalised NLP sentence, self risk row, KPI strip values present
- Dashboard API (admin): 24 risk rows, 24 students, outreach trigger returns `queued_for_mentor` (no email sent)
- Authenticated `/dashboard` HTML includes: Curated for You, Mentor Hub, Dropout risk, Analytics, Amina Okoro, ALX Software, Mentor Ibrahim, Registered users
- Sample metrics: Precision@5 **0.8583**, mentor F1 **0.7778**, dropout AUC **1.0** (synthetic labels)
- Managed browser CDP URL was empty in this sandbox (`browser_cdp_url` blank after prepare), so interactive agent-browser clicks were blocked; page/API evidence above is the verification path used

## Verification checklist (for PR review)

- [x] `/dashboard/login` accepts demo emails
- [x] Scholar sees own opportunities + mentor assignment
- [x] Admin sees risk table and can trigger outreach status
- [x] Analytics shows metrics vs targets
- [x] KPI strip visible on all tabs
- [x] README + `ml-backend/README.md` readable for capstone report
