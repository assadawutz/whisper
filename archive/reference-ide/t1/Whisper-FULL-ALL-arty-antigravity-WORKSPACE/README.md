# Whisper — FULL ALL (Antigravity-first spec + runnable Offline engine)

Offline, Windows 11, for **arty**:
- Next.js (App Router), TypeScript, Tailwind v4 only
- container + sm/md/lg
- Full mode: hints + suggestions + inline ghost (via local daemon APIs)
- No backtrick. No external network required.

## Run (Windows OneClick)
- Install Node.js LTS (>=18.18)
- PowerShell in repo root:
  - `./oneclick.ps1`

Daemon default: http://localhost:8787  
UI default:     http://localhost:8787/ui  

## What you get
- **Daemon**: HTTP + WebSocket stable protocol (autocomplete, ghost, hints, scan, self-learning)
- **UI**: quick panels to test scan/hints/ghost
- **CLI**: terminal companion

## Antigravity-first integration
See: `SPEC/ANTIGRAVITY_INTEGRATION.md`


## Project config (.antigravity)
- Put config at: `.antigravity/whisper.json`
- Spec: `SPEC/ANTIGRAVITY_CONFIG.md`


## Workspace Layout (.antigravity)
See `SPEC/ANTIGRAVITY_WORKSPACE_LAYOUT.md`

## New endpoints
- /v1/project-assets
- /v1/prompts, /v1/snippets, /v1/rules
- /v1/memory/get, /v1/memory/patch
- /v1/log/append
