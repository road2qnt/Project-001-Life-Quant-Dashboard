---
id: decision-journal
type: journal
status: active
created: 2025-01-15
updated: 2025-05-14
tags: [journal, reflections]
token_estimate: 150
---

# Decision Journal

> A personal record of why decisions were made, how they felt, and what was learned in the process.
> More introspective than ADRs. For the human, not the agent.

## 2025-01-15: Project Inception

**Decision:** Start the Life Quant Dashboard as a serious personal analytics project.

**Why now:** Been tracking behaviors informally for months. Data is fragmented. Need a unified system.

**Concerns:** Risk of overbuilding. Need to ship MVP in 2 weeks or the project will die.

**Hedge:** If the project stalls, the architecture document and memory system are reusable artifacts. Not wasted effort.

---

## 2025-05-14: MVP Implementation Complete

**Decision:** Built all MVP features in one go — DB, API, Heatmap, QuickLog, CLI, Telegram Bot.

**Reflection:** The memory system was invaluable. Being able to resume sessions without re-explaining context saved hours. The architecture document (ARCHITECTURE.md) served as the north star.

**What went well:**
- Starting with the database schema first made everything else fall into place
- SVG heatmap approach was the right call — tooltips and hover states work beautifully
- Telegram bot with polling is surprisingly practical. No server, no webhook, just works.
- CLI tool is already useful for quick logging without opening the browser

**What I'd do differently:**
- Should have written tests earlier. Manual validation is getting tedious.
- The Telegram bot 409 conflict was avoidable with a PID file check.
- `react-activity-calendar` is still in `package.json` but ADR-004 rejected it. Should clean up.

**Surprises:**
- Drizzle ORM with SQLite is genuinely pleasant. Type safety end-to-end.
- `npx tsx src/cli/log.ts` is fast enough that a compiled binary isn't needed.
- The bot's multi-word domain lookup (trying 1 word, then 2 words) works better than expected.

**Concerns:**
- No tests. A refactor of `src/lib/api.ts` could break heatmap, CLI, and bot simultaneously.
- Bot runs via `nohup` — if server restarts, bot won't come back automatically.
- 13 seed domains might be too many for a fresh start. Should simplify to 5-7 core domains.

**Next:** Analytics dashboard. The data is flowing in. Time to make sense of it.

---

*Write entries here after significant decisions. One entry per decision. Date-stamped.*
