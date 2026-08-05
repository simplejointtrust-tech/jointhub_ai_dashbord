# Push this Capstone export to GitHub

Destination (empty public repo):
https://github.com/simplejointtrust-tech/jointhub_ai_dashbord

Cofounder’s GitHub integration **cannot write** to `simplejointtrust-tech/*`.
You must push from a machine logged into an account that owns or can write that repo
(Isaiah / simplejointtrust-tech).

## Option A — GitHub CLI (recommended)

```bash
# 1) Unzip the export
unzip jointhub_ai_dashboard_export.zip -d jointhub_ai_dashbord
cd jointhub_ai_dashbord

# 2) Auth as the org/user that owns the destination
gh auth login
# choose GitHub.com → HTTPS → login with browser or token
# token needs `repo` scope (or fine-grained: Contents Read/Write on this repo)

# 3) Initialize and push to main
git init -b main
git add .
git commit -m "Initial Capstone II AI dashboard export from JointHub Africa

Source: Cofounder managed app simplejoint-trust-4b4a02 (Capstone merge c37e791).
Modules: Opportunities, Mentor Hub, Dropout risk, Analytics + ml-backend."

git remote add origin https://github.com/simplejointtrust-tech/jointhub_ai_dashbord.git
git push -u origin main
```

## Option B — Personal access token (HTTPS)

```bash
unzip jointhub_ai_dashboard_export.zip -d jointhub_ai_dashbord
cd jointhub_ai_dashbord
git init -b main
git add .
git commit -m "Initial Capstone II AI dashboard export from JointHub Africa"
git remote add origin https://github.com/simplejointtrust-tech/jointhub_ai_dashbord.git

# Use a classic PAT with repo scope, or fine-grained token with Contents: Read and write
git push -u origin main
# when prompted: username = your GitHub username; password = the PAT
```

## Option C — SSH

```bash
unzip jointhub_ai_dashboard_export.zip -d jointhub_ai_dashbord
cd jointhub_ai_dashbord
git init -b main
git add .
git commit -m "Initial Capstone II AI dashboard export from JointHub Africa"
git remote add origin git@github.com:simplejointtrust-tech/jointhub_ai_dashbord.git
git push -u origin main
```

## Verify after push

```bash
gh api repos/simplejointtrust-tech/jointhub_ai_dashbord/commits/main --jq '{sha: .sha, message: .commit.message}'
# or open:
# https://github.com/simplejointtrust-tech/jointhub_ai_dashbord
```

## Local run after clone

```bash
bun install
bun dev
# open http://localhost:3000/dashboard/login
```

Optional Python ML API:

```bash
cd ml-backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Notes

- Destination was empty at export time, so a normal first push to `main` is enough.
- Do **not** force-push unless you intentionally replace existing history later.
- Do not commit `.env` secrets.
