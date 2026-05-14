# Life Quant Dashboard

> Personal behavioral analytics platform. Track patterns, measure consistency, optimize compounding.

**This is NOT a habit tracker. This is a behavioral operating system.**

---

## Philosophy

Life Quant Dashboard is built on a simple premise: **patterns matter more than streaks.**

Most habit/gamification apps reward showing up. This system rewards showing up **and** doing quality work, revealing the correlations between domains that matter most to your performance.

Tracked domains can include deep work, sleep, training, reading, mood, ICPC practice — anything you can measure numerically.

## Quick Start

```bash
git clone git@github.com:road2qnt/Project-001-Life-Quant-Dashboard.git
cd Project-001-Life-Quant-Dashboard
npm install
npm run dev
```

## Documentation

- [Full Architecture Plan](./docs/ARCHITECTURE.md) — 25-point engineering & product design
- [Agent Memory System](./docs/MEMORY-SYSTEM.md) — Persistent AI-native engineering context
- [Active Context](./memory/active-context.md) — Current project state
- [Architecture Decisions](./memory/architecture-decisions.md) — ADR log

## Project Structure

```
├── src/          # Next.js application
├── docs/         # Design documentation
├── memory/       # Agent memory system (persistent context)
└── cli/          # CLI logging tool (future)
```

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 |
| Database | SQLite (MVP) / PostgreSQL (future) |
| ORM | Drizzle |
| State | Zustand |
| AI | Vercel AI SDK + Ollama/OpenAI |

## MVP Features

- [ ] Quick-log widget (<10s per entry)
- [ ] GitHub-style heatmap visualization
- [ ] Consistency scoring (replaces streaks)
- [ ] Multi-domain support
- [ ] Weekly auto-generated snapshots

## License

MIT
