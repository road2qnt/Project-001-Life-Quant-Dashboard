---
id: active-context
type: context
status: active
created: 2025-01-15
updated: 2025-05-14
tags: [context, active]
token_estimate: 250
---

# Active Context

> **Project:** Life Quant Dashboard
> **Phase:** MVP Complete — Implementation
> **Current Focus:** Polish, testing, and extension

## Project State

- **Repository:** `git@github.com:road2qnt/Project-001-Life-Quant-Dashboard.git`
- **Stack:** Next.js 16, TypeScript 5, Tailwind CSS 4, SQLite (better-sqlite3), Drizzle ORM, Zustand, Zod
- **What exists:**
  - ✅ Database schema (events, domains tables) + seed script
  - ✅ REST API (`/api/events`, `/api/analytics/consistency/[domainId]`)
  - ✅ SVG Heatmap (52 weeks, 5-level green scale, tooltips, month/day labels)
  - ✅ QuickLog Widget (floating FAB with form)
  - ✅ CLI Logger (`src/cli/log.ts` — npx tsx, positional args, interactive mode)
  - ✅ Telegram Bot (`@life_quant_logger_bot` — polling, /start /help /domains /log)
- **Next milestone:** Analytics dashboard (trends, correlations, insights)

## Key Documents

- [Architecture Plan](../docs/ARCHITECTURE.md)
- [Memory System Design](../docs/MEMORY-SYSTEM.md)

## Active Decisions

- Events are append-only (immutable log)
- Local-first with SQLite
- Consistency scoring replaces streak counting
- SVG heatmap (365 `<rect>` elements with tooltips)
- Zustand for state (though components use local state for now)
- CLI built with tsx (no build step needed)
- Telegram bot uses long-polling (no webhook needed)

## Current Priorities

See [current-focus.md](./current-focus.md)

## Risks

- `better-sqlite3` is native — needs build tools on deployment
- Telegram bot runs via nohup — no auto-restart on system reboot
- No tests written yet (manual validation only)
