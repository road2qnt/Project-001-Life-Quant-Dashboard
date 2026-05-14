---
id: current-focus
type: priorities
status: active
created: 2025-01-15
updated: 2025-05-14
tags: [priorities, focus]
token_estimate: 150
---

# Current Focus

> Priority legend: P0 = blocking, P1 = important, P2 = nice to have

## P0 — Must Do Next

- [ ] Analytics dashboard (trends, correlations, insights over time)
- [ ] Add /today command to Telegram bot (daily summary)
- [ ] Write unit tests for core modules (consistency, API, CLI)

## P1 — This Phase

- [ ] Systemd service or pm2 for bot auto-restart
- [ ] Cross-domain correlation analysis (e.g., sleep ↔ deep work)
- [ ] Weekly snapshot generation from analytics data

## P2 — Next Phase

- [ ] LLM-based weekly review generation
- [ ] Streak visualization (current streak, longest streak per domain)
- [ ] Data export/import (JSON, CSV)

## Completed ✅

- ✅ SQLite + Drizzle ORM setup
- ✅ Database schema (events, domains) + seed script
- ✅ REST API (events, consistency)
- ✅ SVG Heatmap (GitHub-style, 365 cells, 5-level green)
- ✅ QuickLog Widget (floating FAB + form)
- ✅ CLI Logger (`npx tsx src/cli/log.ts`)
- ✅ Telegram Bot (`@life_quant_logger_bot`)
- ✅ Memory system scaffolding
