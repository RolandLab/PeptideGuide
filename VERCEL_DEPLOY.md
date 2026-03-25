# Deploying PeptideGuide Web On Vercel

This repo now includes a minimal [`vercel.json`](./vercel.json) so Vercel can host the current static web app and redirect the site root to [`/web/`](./web/).

## What You Need

- A Vercel account
- This repo pushed to GitHub, GitLab, or Bitbucket

## Recommended Setup

Use Git-based deployments instead of manual CLI deploys.

- `main`: stable public demo
- feature branches: phase-by-phase preview links for testers

Vercel will create:

- a production deployment for `main`
- a preview deployment for each branch push / pull request

## Import The Repo

1. Sign in to Vercel.
2. Import this repository as a new project.
3. Keep the project root set to the repo root:
   `/Users/shawnroland/Documents/Playground`
4. Framework preset:
   `Other`
5. Build command:
   leave empty
6. Output directory:
   leave empty
7. Deploy.

## Why The Repo Root Matters

The app entrypoint is in [`web/index.html`](./web/index.html), but it also reads the shared dataset from:

- [`Sources/PeptideGuideApp/Resources/peptides.json`](./Sources/PeptideGuideApp/Resources/peptides.json)

If Vercel is pointed only at `web/`, that JSON path will break.

## Demo Workflow

1. Push work to a feature branch.
2. Share the Vercel preview URL with testers.
3. Iterate until the phase is ready.
4. Merge to `main` to update the public demo.

## Optional Next Steps

- Add a custom domain
- Enable deployment protection if you want limited-access previews
- Add analytics
- Add a backend later if you want shared saved data across users
