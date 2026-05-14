# Life Quant Dashboard — Engineering & Product Architecture

> **Document Status:** Active Design v0.1
> **Last Updated:** $(date +%Y-%m-%d)
> **Author:** Systems Architect
> **Repository:** `git@github.com:road2qnt/Project-001-Life-Quant-Dashboard.git`

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Core Problem Definition](#2-core-problem-definition)
3. [User Persona](#3-user-persona)
4. [Feature Prioritization](#4-feature-prioritization)
5. [System Architecture](#5-system-architecture)
6. [Database Schema](#6-database-schema)
7. [Backend Plan](#7-backend-plan)
8. [Frontend Plan](#8-frontend-plan)
9. [AI Integration Opportunities](#9-ai-integration-opportunities)
10. [Analytics Engine Design](#10-analytics-engine-design)
11. [Heatmap System Design](#11-heatmap-system-design)
12. [Long-term Roadmap](#12-long-term-roadmap)
13. [MVP Scope](#13-mvp-scope)
14. [Anti-feature List](#14-anti-feature-list)
15. [UI/UX Philosophy](#15-uiux-philosophy)
16. [Dev Workflow](#16-dev-workflow)
17. [Suggested Tech Stack](#17-suggested-tech-stack)
18. [Folder Structure](#18-folder-structure)
19. [API Design](#19-api-design)
20. [Example Data Models](#20-example-data-models)
21. [Event Tracking Design](#21-event-tracking-design)
22. [Future Monetization Potential](#22-future-monetization-potential)
23. [Security/Privacy Considerations](#23-securityprivacy-considerations)
24. [Local-First vs Cloud Tradeoffs](#24-local-first-vs-cloud-tradeoffs)
25. [Deployment Architecture](#25-deployment-architecture)

---

## 1. Product Vision

**Life Quant Dashboard** is a personal behavioral analytics platform that transforms raw daily actions into measurable patterns, consistency scores, and performance intelligence.

It is NOT a habit tracker. It is NOT a gamified streak app. It is a **personal performance telemetry system**.

### Core Beliefs

- **What gets measured gets managed** — but measurement must be low-friction
- **Patterns matter more than streaks** — 3 days of 7/10 work + 4 days of 0/10 reveals more than "3-day streak"
- **Correlation exposes truth** — sleep quality predicting deep work depth is actionable; streak counts are not
- **Self-deception is the enemy** — the system must make it hard to lie to yourself
- **Compounding requires consistency, not intensity** — the analytics should reward showing up, not over-optimizing

### North Star Metric

**Actionable insights per week.** Not data points collected. Not streaks maintained. How many times per week does the system tell you something true about your behavior that you didn't already consciously know?

---

## 2. Core Problem Definition

### Problem Statement

High-performing individuals track their lives across multiple domains (work, training, sleep, learning) but face four systemic problems:

1. **Fragmentation** — Data lives in separate tools (Obsidian, calendar, fitness apps, GitHub). No unified view.
2. **No Signal Extraction** — Raw logs don't produce insight. A journal entry doesn't tell you your sleep declined 3 days before your deep work dropped.
3. **Streak Toxicity** — Streak-based gamification rewards showing up over doing what matters. It punishes strategic rest.
4. **Cognitive Overhead** — Most tracking tools require more input energy than they return in insight.

### System Requirements

| Requirement | Description |
|---|---|
| Low-friction input | ≤30 seconds per log entry |
| Zero-maintenance analytics | Insights generated automatically |
| Pattern-first visualization | Heatmaps, trend lines, correlation matrices |
| Privacy-preserving | Local-first architecture with optional sync |
| Extensible domain model | Add/remove tracked domains without schema migrations |

---

## 3. User Persona

### Primary Persona: "The Quantified Engineer"

- **Age:** 25–40
- **Occupation:** Software engineer, researcher, founder, or technical analyst
- **Technical level:** Comfortable with CLI, knows Git, uses Obsidian, understands basic statistics
- **Behavioral traits:**
  - Already tracks SOME things (spreadsheets, Obsidian logs, fitness watch)
  - Frustrated by lack of cross-domain correlation
  - Skeptical of "productivity porn"
  - Values long-term compounding over short-term optimization
  - Willing to invest 2–5 min/day on logging
- **Pain points:**
  - "I know I should sleep better, but I don't know HOW MUCH it actually affects my coding output"
  - "I keep bouncing between tracking methods — nothing sticks"
  - "Every habit app treats me like I need gold stars and animations"

### Secondary Persona: "The Researcher"

- Interested in behavioral data science
- Wants to export data for analysis in Python/R
- Cares about data integrity and timestamps
- Less interested in the UI, more interested in the API

---

## 4. Feature Prioritization

### P0 (MVP — Ship First)

| Feature | Rationale |
|---|---|
| Daily quick-log UI | Core input mechanism. Must be functional day 1. |
| GitHub-style heatmap | Central visualization. The primary interface. |
| Domain configuration | Add/remove tracked domains without code changes. |
| Consistency scoring per domain | The core metric. Replaces streaks. |
| Data persistence (SQLite local) | Must survive page refresh. |
| Weekly review snapshot | Auto-generated summary every 7 days. |

### P1 (Phase 2 — Within 2 weeks of MVP)

| Feature | Rationale |
|---|---|
| Cross-domain correlation view | The differentiating feature. Sleep → Work correlation. |
| Trend line overlays on heatmap | Direction detection (improving/declining). |
| CLI logging tool | Low-friction input for terminal-heavy users. |
| Minimal API layer | Enable integrations. |
| Backup/export to JSON | Data portability. |

### P2 (Phase 3 — Within 4 weeks)

| Feature | Rationale |
|---|---|
| Telegram bot input | Async logging from phone. |
| Burnout detection heuristic | Pattern-based risk indicator. |
| "Failure cascade" visualization | Sankey or flow diagram showing domain interactions. |
| Anomaly detection | Statistical outliers in any domain. |
| AI insight generation | Weekly natural language behavioral summary. |

### P3 (Future)

| Feature | Rationale |
|---|---|
| Obsidian plugin | Bidirectional sync with vault. |
| GitHub integration | Auto-import commit patterns. |
| Calendar integration | Auto-import events as time blocks. |
| Vector search on logs | Semantic query over journal entries. |
| Mobile PWA | Quick-log from phone browser. |

### Explicitly NOT Building

See [Anti-feature List](#14-anti-feature-list).

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Next.js)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Quick-Log│  │ Heatmap  │  │ Analytics Views  │  │
│  │  Widget  │  │  Canvas  │  │ (Correlations)   │  │
│  └────┬─────┘  └──────────┘  └──────────────────┘  │
│       │                                              │
│  ┌────▼──────────────────────────────────────────┐  │
│  │        Local State (Zustand + IndexedDB)       │  │
│  │  - Daily logs cache                            │  │
│  │  - Computed analytics cache                    │  │
│  └────┬──────────────────────────────────────────┘  │
└───────┼─────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│              Service Layer (Next.js API)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Log API  │  │Analytics │  │  Export/Import   │  │
│  │          │  │ Engine   │  │                  │  │
│  └────┬─────┘  └──────────┘  └──────────────────┘  │
└───────┼─────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────┐
│               Database Layer (PostgreSQL/SQLite)      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Events  │  │ Domains  │  │  Snapshots       │  │
│  │  Table   │  │  Config  │  │  (Weekly cache)  │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Architecture Decision Records

**ADR-1: Local-first with optional sync.**
- SQLite via `better-sqlite3` for single-user. PostgreSQL optional.
- Rationale: Eliminates latency, enables offline use, reduces deployment complexity.
- Tradeoff: Multi-device sync requires additional engineering.

**ADR-2: Monorepo with clear module boundaries.**
- Next.js App Router handles both frontend and API routes.
- `/src/lib/analytics` as a pure computation module (no React).
- Rationale: Solo developer velocity. One deploy target.

**ADR-3: Event-sourced data model.**
- Every log is an event with timestamp, domain, value, and metadata.
- Snapshots computed on read or cached on write.
- Rationale: Maximum flexibility for retroactive analytics. Enables "rewind" capability.

**ADR-4: Computed analytics are cached, not stored.**
- Consistency scores, trends, correlations are computed from raw events.
- Cache invalidated on new event write.
- Rationale: Avoids stale derived data. Keeps event table as source of truth.

---

## 6. Database Schema

```sql
-- Core domain configuration
CREATE TABLE domains (
  id          TEXT PRIMARY KEY,          -- e.g., 'deep-work', 'sleep'
  label       TEXT NOT NULL,             -- e.g., 'Deep Work'
  icon        TEXT,                      -- emoji or icon name
  unit        TEXT,                      -- 'hours', 'sessions', '1-10'
  type        TEXT NOT NULL DEFAULT 'numeric', -- 'numeric', 'boolean', 'scale'
  min_value   REAL DEFAULT 0,
  max_value   REAL DEFAULT 10,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  archived    INTEGER DEFAULT 0
);

-- Raw event log (immutable append-only)
CREATE TABLE events (
  id          TEXT PRIMARY KEY,
  domain_id   TEXT NOT NULL REFERENCES domains(id),
  timestamp   TEXT NOT NULL,             -- ISO 8601
  value       REAL NOT NULL,             -- numeric value for the domain
  note        TEXT,                      -- optional context
  source      TEXT DEFAULT 'manual',     -- 'manual', 'cli', 'telegram', 'api', 'integration'
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for heatmap queries (daily aggregation)
CREATE INDEX idx_events_domain_date ON events(domain_id, timestamp);

-- Weekly snapshots (computed cache)
CREATE TABLE weekly_snapshots (
  id            TEXT PRIMARY KEY,
  domain_id     TEXT NOT NULL REFERENCES domains(id),
  week_start    TEXT NOT NULL,           -- Monday of week (ISO 8601)
  consistency   REAL,                    -- 0.0 to 1.0
  total_value   REAL,
  num_events    INTEGER,
  trend         TEXT,                    -- 'improving', 'declining', 'stable', 'insufficient'
  metadata      TEXT,                    -- JSON blob for extensibility
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(domain_id, week_start)
);

-- Cross-domain correlation cache
CREATE TABLE correlations (
  id              TEXT PRIMARY KEY,
  domain_a_id     TEXT NOT NULL REFERENCES domains(id),
  domain_b_id     TEXT NOT NULL REFERENCES domains(id),
  pearson_r       REAL,
  lag_days        INTEGER DEFAULT 0,    -- lag correlation (X affects Y after N days)
  sample_size     INTEGER,
  significance    REAL,                  -- p-value approximation
  computed_at     TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(domain_a_id, domain_b_id, lag_days)
);

-- Agent memory / journal (for AI context)
CREATE TABLE agent_memory (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL,             -- 'decision', 'insight', 'failure', 'goal'
  content     TEXT NOT NULL,
  metadata    TEXT,                      -- JSON tags, references
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- System config (key-value store)
CREATE TABLE config (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,             -- JSON
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Schema Design Rationale

| Decision | Why |
|---|---|
| `events` table is append-only | Immutable logs enable replay analytics. No UPDATEs. |
| Domains are configurable via DB | No schema changes to add tracking. Config as data. |
| Weekly snapshots are cached | Computed from events, not stored separately. |
| Correlations have `lag_days` | Enables delayed-effect detection (e.g., poor sleep → bad work 2 days later). |
| `agent_memory` is separate | AI context survives schema migrations. |

---

## 7. Backend Plan

### API Layer (Next.js Route Handlers)

```
POST   /api/events              # Log an event
GET    /api/events?domain=&from=&to=  # Query events
DELETE /api/events/:id          # Delete/undo an event

GET    /api/analytics/consistency/:domain  # Consistency score
GET    /api/analytics/trend/:domain        # Trend analysis
GET    /api/analytics/correlations         # Cross-domain correlations
GET    /api/analytics/burnout-risk         # Burnout detection

GET    /api/domains              # List configured domains
POST   /api/domains              # Add a domain
PATCH  /api/domains/:id          # Update domain config

POST   /api/snapshots/generate   # Trigger weekly snapshot computation

GET    /api/export               # Export all data as JSON
POST   /api/import               # Import data from JSON
```

### Analytics Engine (Pure Computation Module)

Located in `/src/lib/analytics/` — zero React dependencies, fully testable.

```typescript
// Core interface
interface AnalyticsEngine {
  consistencyScore(events: Event[]): number;
  // Formula: (num days with activity / total days in period) * 
  //          (avg value on active days / max_value)
  // This penalizes both absence AND low effort.

  trendDirection(weeklyScores: number[]): 'improving' | 'declining' | 'stable';
  // Linear regression slope over weekly averages.
  // |slope| < 0.1 * stddev → 'stable'

  pearsonCorrelation(eventsA: Event[], eventsB: Event[], lagDays: number): number;
  // Standard Pearson r with configurable lag.

  burnoutRisk(recentConsistency: number, baselineConsistency: number, 
              recentVariability: number): 'low' | 'moderate' | 'high';
  // Sudden drop in consistency + increased variability → burnout signal.

  failureCascade(events: Record<string, Event[]>): string[];
  // Example: sleep dropped 20% → 2 days later deep work dropped 30% → 3 days later mood dropped.
  // Returns detected cascade chains.
}
```

### Key Implementation Details

- **No ORM in analytics layer.** Raw SQL for performance. Drizzle/Primsa for CRUD.
- **Computation is lazy.** Analytics computed on read, cached in weekly snapshots.
- **Critical path: event write.** Must be <50ms. Analytics can be async.

---

## 8. Frontend Plan

### Component Tree

```
Layout
├── Sidebar
│   ├── DomainNav (list of tracked domains)
│   └── QuickStats (today's summary)
├── MainContent
│   ├── HeatmapView
│   │   ├── HeatmapCanvas (SVG-based, ~365 cells)
│   │   ├── ConsistencyGauge (single-number metric)
│   │   └── TrendIndicator (arrow + direction)
│   ├── QuickLogWidget
│   │   ├── DomainSelector
│   │   ├── ValueInput (slider / number / toggle)
│   │   └── SubmitButton
│   ├── AnalyticsView
│   │   ├── CorrelationMatrix
│   │   ├── TrendCharts (per-domain time series)
│   │   └── BurnoutIndicator
│   └── WeeklyReview
│       ├── SnapshotCard (per domain)
│       └── AIInsight (generated text)
└── MemoryPanel (collapsible agent context)
```

### State Management (Zustand)

```typescript
interface Store {
  // Data
  events: Event[];
  domains: Domain[];
  weeklySnapshots: Record<string, WeeklySnapshot[]>;
  
  // UI State
  activeDomain: string | null;
  viewMode: 'heatmap' | 'analytics' | 'review';
  
  // Actions
  logEvent: (domainId: string, value: number, note?: string) => void;
  deleteEvent: (id: string) => void;
  switchDomain: (id: string) => void;
}
```

### Rendering Strategy

- **Heatmap:** SVG `<rect>` elements (not canvas). DOM-per-cell enables tooltips, animations, and accessibility.
- **Charts:** Lightweight SVG via custom components (no chart library dependency initially). Recharts or visx only if needed.
- **Optimization:** Virtualize year-level heatmap. Only render visible months fully.

---

## 9. AI Integration Opportunities

### Design Philosophy

AI should **augment insight, not replace thinking.** The human remains the decision-maker. AI surfaces patterns the human would otherwise miss or compute manually.

### Integration Points

| Layer | AI Capability | Implementation |
|---|---|---|
| Weekly Review | Natural language summary of behavioral patterns | Prompt: "Given this week's events, identify 1-2 patterns, 1 anomaly, and 1 actionable recommendation." Client-side LLM call (or local via Ollama). |
| Anomaly Detection | Statistical outlier identification | Z-score based. Flag events >2σ from personal baseline. LLM-generated explanation of potential context. |
| Failure Cascade | Detect correlated domain drops | Graph traversal over lag-correlation matrix. LLM summarizes cascade chain. |
| Adaptive Recommendations | Suggest domain adjustments based on patterns | Rule-based + LLM refinement. "Your deep work peaks 2h after morning gym. Schedule accordingly." |
| Query Interface | Natural language data queries | "What's my best deep work day of the week?" → Translate to analytics query. |
| Agent Memory Summarization | Compress session context into structured markdown | Automated pipeline (see MEMORY-SYSTEM.md) |

### Anti-Patterns (NOT Doing)

- ❌ AI coach / motivational chatbot
- ❌ AI-generated daily affirmations
- ❌ Auto-tagging events with no human review
- ❌ Predictive "you'll fail tomorrow" messages
- ❌ Replacing human journaling with AI summaries

### Execution Strategy

1. **Phase 1:** Rule-based analytics only. No AI calls. Ship the math.
2. **Phase 2:** LLM-powered weekly review. Local (Ollama) or API (OpenAI/Anthropic). User-controlled.
3. **Phase 3:** Anomaly detection + failure cascade. Hybrid rule-based + LLM.

---

## 10. Analytics Engine Design

### Metrics

#### Consistency Score

```
consistency = (active_days / total_days) * (avg_active_value / max_value)

Where:
- active_days = days with at least one event in domain
- total_days = days in analysis period
- avg_active_value = mean value on days with activity
- max_value = domain's configured maximum

Range: 0.0 to 1.0
Interpretation:
- 0.8+ : Strong consistency
- 0.5-0.8: Moderate consistency
- 0.2-0.5: Inconsistent
- <0.2: No meaningful practice
```

#### Trend Direction

- Compute weekly consistency scores over last 8 weeks
- Fit linear regression
- Slope > 0.1 → `improving`
- Slope < -0.1 → `declining`
- Otherwise → `stable`
- <4 weeks of data → `insufficient`

#### Cognitive Drift Detection

Cognitive drift is a subtle, gradual decline in performance that a single trend may miss because it's spread over weeks.

- Compare 4-week rolling average against 12-week rolling average
- If 4-week avg trails 12-week avg by >0.15 consistency points for 3+ consecutive weeks → `drift detected`
- Decompose drift into: frequency decline (showing up less) vs intensity decline (showing up but phoning it in)
- Flag specific week where drift began for retroactive analysis

#### Habit Decay Patterns

When a domain goes untracked for N days, the system analyzes the decay curve on return:

- Track the "return-to-baseline" days after a gap of 3+, 7+, and 14+ days
- Compute decay coefficient: `(value_on_return - avg_value) / days_missed`
  - Large negative coefficient → habit decays quickly with missed days
  - Near-zero coefficient → habit is resilient to gaps
- Flag domains with decay coefficient < -0.2 as "high decay risk"
- Overlay on heatmap: show decay recovery gradient (how many days to return to baseline after a gap)

#### Recovery Analysis

Detects how effectively the user returns to baseline after a dip or gap:

- Identify all periods where consistency dropped >0.2 from rolling average
- Measure: `recovery_days = days from trough to return-to-baseline`
- Classify:
  - <3 days: Rapid recovery (resilient)
  - 3-7 days: Normal recovery
  - >7 days: Slow recovery (risk factor)
- Track recovery trend: is recovery getting faster or slower over time?
- Cross-domain recovery signal: does poor sleep delay recovery in deep work?

#### Cross-Domain Correlation

- Pairwise Pearson r per week
- Applied at lag 0, 1, 2, 3, 7 days
- Minimum 14 data points for significance
- Flag correlations where |r| > 0.5

#### Burnout Risk Index

```
risk_score = 0.4 * (1 - recent_consistency / baseline_consistency)
           + 0.3 * recent_variability
           + 0.3 * (1 - mood_trend)

Where:
- recent_consistency = last 2 weeks
- baseline_consistency = 8-week rolling window
- recent_variability = coefficient of variation in last 2 weeks
- mood_trend = slope of mood domain (if tracked)
```

#### Failure Cascade Analysis

Detects chains of domain drops occurring at lagged intervals:

```
Algorithm:
1. For each pair of domains (A, B), compute cross-correlation at lags 1-7
2. If A's drop significantly predicts B's drop N days later (|r| > 0.5, p < 0.05):
   → Record edge A -(N days)→ B
3. Build directed graph from significant edges
4. Find chains of length 3+: Poor Sleep -(2d)→ Low Deep Work -(1d)→ Low Mood
5. Rank chains by cumulative consistency impact
6. Flag repeating cascade patterns (same chain occurs 3+ times in dataset)
```

#### Anomaly Detection

- Z-score per domain: `|value - mean| / std` > 2.0 → anomaly
- Contextual anomaly: value is normal for the user but unusual for the current day-of-week or time context
- Streak anomaly: N consecutive days below 50% of personal average (unusual lull)
- Anomalies are marked on the heatmap with a distinct visual indicator (✦)

### Computation Model

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│ Event Write  │────▶│ Invalidate Cache │────▶│ Recompute    │
│ (append-only)│     │ (mark stale)     │     │ (async, lazy)│
└──────────────┘     └──────────────────┘     └──────┬───────┘
                                                      │
                        ┌─────────────────────────────┘
                        ▼
              ┌─────────────────────┐
              │ Cache Weekly        │
              │ Snapshot in DB      │
              └─────────────────────┘
```

---

## 11. Heatmap System Design

### Beyond Streaks — What the Heatmap Actually Shows

| Element | What It Replaces | What It Shows |
|---|---|---|
| Cell color intensity | "Streak day" (binary) | Value magnitude (0 to max). Lighter = low effort, darker = high effort. |
| Cell border | Streak counter | Consistency classification. Gray border = missed day. |
| Monthly label | Month name | Month name + monthly consistency score. |
| Year header | Year | Year-level trend arrow. |
| Tooltip | "Day X of streak" | Date, value, consistency delta from rolling average, trend. |

### Visualization Design

```
┌──────────────────────────────────────────────────────────┐
│  Deep Work          ● 0.74 consistency  ▲ improving      │
│                                                          │
│          Jan          Feb          Mar          Apr      │
│  Mon  [▁▁▃▄▆█]  [▁▃▄▆█▁▃]  [▄▆█▁▃▄▆]  [█▁▃▄▆█▁]      │
│  Tue  [▃▄▆█▁▃▄]  [▆█▁▃▄▆█]  [▁▃▄▆█▁▃]  [▄▆█▁▃▄▆]      │
│  Wed  [█▁▃▄▆█▁]  [▃▄▆█▁▃▄]  [▆█▁▃▄▆█]  [▁▃▄▆█▁▃]      │
│  ...                                                      │
│                                                          │
│  Overlay: Trend line (7-day rolling average)             │
│  Overlay: Anomaly markers (✦ = outlier day)              │
└──────────────────────────────────────────────────────────┘
```

### Color Palette

```css
/* 5-level intensity scale */
.level-0: #1a1a1a;  /* No activity */
.level-1: #0e4429;  /* Low (1-25% of max) */
.level-2: #006d32;  /* Medium-low (25-50%) */
.level-3: #26a641;  /* Medium-high (50-75%) */
.level-4: #39d353;  /* High (75-100%) */

/* Accessibility: Add pattern overlay for color-blind users */
```

### Interaction Design

- **Hover:** Show tooltip with full data (date, value, consistency delta)
- **Click:** Open day detail view (all events for that day)
- **Double-click:** Quick-log for that date
- **Scroll:** Navigate between weeks/months
- **Domain selector:** Switch which domain is displayed
- **Overlay toggle:** Show/hide trend line, anomaly markers

### Performance

- Render ~365 cells per domain
- SVG with `<rect>` elements
- Virtualize: only render visible viewport + 1 month buffer
- Memoize cell colors (computed from values, not re-rendered)
- Target: <10ms render time on modern hardware

---

## 12. Long-term Roadmap

```
Week 1-2    │ MVP: Quick-log + heatmap + 1 domain
Week 3-4    │ Phase 2: Multiple domains, consistency scoring, weekly snapshots
Week 5-6    │ Phase 3: Cross-domain correlations, trend detection
Week 7-8    │ Phase 4: CLI tool, Telegram bot, export/import
Week 9-10   │ Phase 5: Burnout detection, failure cascade
Week 11-12  │ Phase 6: AI weekly review, anomaly detection
Week 13-16  │ Phase 7: Integrations (GitHub, Calendar, Obsidian)
Ongoing     │ Polish, performance, personalization
```

### Realistic Timeline

- **MVP (functional):** 2 weeks (solo, part-time evenings/weekends)
- **Usable daily driver:** 4 weeks
- **Full vision prototype:** 8-12 weeks

---

## 13. MVP Scope

### What's In

- [ ] Single-page app with:
  - [ ] Quick-log widget (domain selector + value input + submit)
  - [ ] GitHub-style heatmap for one domain
  - [ ] Consistency score display
- [ ] Default domain: "Deep Work" (numerical, 0-10)
- [ ] Local SQLite storage (via `better-sqlite3` or `idb`)
- [ ] One command: `npm run dev` → ready to use

### What's Not In MVP

- Multi-domain tracking (add post-MVP, but design schema for it now)
- CLI tool
- Telegram bot
- Cross-domain correlations
- AI insights
- Export/import
- Any integration
- Mobile optimization (desktop-first)

### MVP Database (SQLite)

```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  domain_id TEXT NOT NULL DEFAULT 'deep-work',
  timestamp TEXT NOT NULL,
  value REAL NOT NULL,
  note TEXT,
  source TEXT DEFAULT 'manual',
  created_at TEXT DEFAULT (datetime('now'))
);
```

That's it. 1 table, 7 columns. Extend later.

### MVP Success Criteria

- [ ] Can log a "deep work" session in <10 seconds
- [ ] Heatmap renders and is visually useful
- [ ] Consistency score matches manual calculation
- [ ] App loads in <1 second cold start
- [ ] Zero crashes or data loss on reload

---

## 14. Anti-feature List

**Features that are explicitly NOT being built:**

| Anti-feature | Reason |
|---|---|
| Streak counters | Gamification that rewards showing up over doing good work. Replaced by consistency scoring. |
| Social features | Not a social app. No leaderboards, no sharing, no friends. |
| Push notifications | "Don't break your streak!" alerts are toxic. The user checks when they want. |
| Gamification (badges, XP, levels) | Externalizes motivation. The system should serve the user's intrinsic drive. |
| AI life coach | Artificial, annoying, and philosophically wrong for this product. |
| Habit recommendations | "You should meditate" — the system doesn't know what the user should do. It shows patterns. |
| Calendar view | Not a planner. Not a scheduling tool. It's an analytics tool. |
| Reminders | "Time to log!" — friction creates discipline, not notifications. |
| Public profiles | Privacy-first. Data belongs to the user. |
| Mobile app (native) | PWA is sufficient for quick-log. Native app is scope creep. |

---

## 15. UI/UX Philosophy

### Design Principles

1. **Fast by default.** No loading spinners. Data is local. Transitions are instant.
2. **Information-dense.** Show more data, less chrome. Think GitHub, Obsidian, financial dashboards.
3. **Cognitively clean.** One primary action per screen. Everything else is secondary.
4. **Monochrome + one color.** Dark theme default. Green accent for positive patterns. Red for decline. Gray for neutral.
5. **Keyboard-first.** Tab navigation, keyboard shortcuts, input without mouse.
6. **Progressive disclosure.** MVP shows heatmap + quick-log. Advanced views are one click away.

### Visual Language

- **Font:** Geist (system UI) + Geist Mono (data/numerics)
- **Colors:** Black, white, 5 shades of gray, green scale for heatmap
- **Spacing:** Dense. No wasted whitespace. GitHub density.
- **Borders:** Minimal. Use background color to separate sections.
- **Animation:** Only for state transitions (domain switch, data update). No decorative animations.
- **Dark mode:** Default. Light mode secondary.

### Layout (MVP)

```
┌──────────────────────────────────────────────────┐
│  [icon] Life Quant Dashboard            [⚙] [☰]  │
├──────────────────────────────────────────────────┤
│                                                   │
│  ┌────────────────────────────────────────┐       │
│  │  Deep Work                     ◆ 0.74  │       │
│  │  [▲] improving                         │       │
│  │                                        │       │
│  │  [HEATMAP RENDERED HERE]               │       │
│  │                                        │       │
│  └────────────────────────────────────────┘       │
│                                                   │
│  ┌────────────────────────────────────────┐       │
│  │  Quick Log                     [▶]     │       │
│  │  Domain: [Deep Work ▼]                  │       │
│  │  Value:  [====●==========] 7/10        │       │
│  │  Note:   [__________________]          │       │
│  │  [Log Session]                         │       │
│  └────────────────────────────────────────┘       │
│                                                   │
└──────────────────────────────────────────────────┘
```

---

## 16. Dev Workflow

### Setup

```bash
git clone git@github.com:road2qnt/Project-001-Life-Quant-Dashboard.git
cd Project-001-Life-Quant-Dashboard
npm install
npm run dev
```

### Daily Workflow

1. `git pull` (if working across machines)
2. `npm run dev` (starts Next.js dev server)
3. Edit → Save → See changes in browser
4. Before commit: `npm run lint && npm run typecheck`
5. Commit with conventional commit message

### Code Review (for solo dev)

- Self-review before every PR/commit
- Run the code-reviewer-deepseek agent on significant changes
- Maintain `memory/failures-and-lessons.md` for mistakes

### Testing Strategy

| Layer | Tool | Scope |
|---|---|---|
| Unit (analytics) | Vitest | Pure functions. No React. |
| Component | Vitest + Testing Library | Key UI components (heatmap, quick-log) |
| E2E | Playwright or Cypress | Smoke test: log event → see heatmap update |
| Manual | Browser + devtools | Daily use of the app. Dogfood everything. |

---

## 17. Suggested Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR/SSG, API routes, file-based routing. Single deploy target. |
| Language | TypeScript 5 | Strict mode. No `any` types. |
| Styling | Tailwind CSS 4 | Utility-first. Fast iteration. Small bundle. |
| Database | SQLite (`better-sqlite3`) via Drizzle | Zero infrastructure. Portable. Easy backup. |
| ORM | Drizzle ORM | Type-safe. Lightweight. Raw SQL when needed. |
| State | Zustand | Minimal boilerplate. No providers. Works outside React. |
| Charts | Custom SVG (heatmap) + Recharts (correlation) | Heatmap is simple enough for raw SVG. Analytics need chart library. |
| AI (client) | Vercel AI SDK + OpenAI/Ollama | Unified interface for streaming LLM responses. |
| Font | Geist + Geist Mono | Designed for Next.js. Clean and readable. |
| Dev tools | Vitest, ESLint, Prettier | Standard. Fast. No surprises. |
| CLI | Commander.js (for `lq` CLI tool) | Mature. Well-typed. Supports subcommands. |

### Why SQLite over PostgreSQL for MVP

| Factor | SQLite | PostgreSQL |
|---|---|---|
| Setup | `npm install` only | Requires server, Docker, or cloud |
| Backup | Single file. `cp data.db backup.db` | Requires pg_dump |
| Performance for single user | Excellent | Overkill |
| Migration path | Easy to dump/import to PG | N/A |

PostgreSQL can be added later if multi-device sync is needed.

---

## 18. Folder Structure

```
life-quant-dashboard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Main dashboard page
│   │   ├── globals.css
│   │   └── api/
│   │       ├── events/
│   │       │   └── route.ts
│   │       ├── analytics/
│   │       │   ├── consistency/
│   │       │   │   └── route.ts
│   │       │   ├── trend/
│   │       │   │   └── route.ts
│   │       │   └── correlations/
│   │       │       └── route.ts
│   │       └── domains/
│   │           └── route.ts
│   │
│   ├── components/             # React components
│   │   ├── heatmap/
│   │   │   ├── Heatmap.tsx
│   │   │   ├── HeatmapCell.tsx
│   │   │   ├── HeatmapTooltip.tsx
│   │   │   └── ConsistencyBadge.tsx
│   │   ├── quick-log/
│   │   │   ├── QuickLog.tsx
│   │   │   ├── DomainSelector.tsx
│   │   │   └── ValueSlider.tsx
│   │   ├── analytics/
│   │   │   ├── CorrelationMatrix.tsx
│   │   │   ├── TrendChart.tsx
│   │   │   └── BurnoutIndicator.tsx
│   │   └── ui/
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       └── Tooltip.tsx
│   │
│   ├── lib/                    # Shared logic (zero React deps)
│   │   ├── analytics/
│   │   │   ├── index.ts        # Public API
│   │   │   ├── consistency.ts
│   │   │   ├── trends.ts
│   │   │   ├── correlations.ts
│   │   │   └── burnout.ts
│   │   ├── db/
│   │   │   ├── index.ts        # DB connection + schema
│   │   │   ├── schema.ts       # Drizzle schema definitions
│   │   │   └── migrations/     # Drizzle migrations
│   │   ├── ai/
│   │   │   ├── index.ts        # AI service facade
│   │   │   └── prompts.ts      # LLM prompt templates
│   │   └── utils/
│   │       ├── dates.ts
│   │       ├── math.ts
│   │       └── types.ts
│   │
│   └── store/
│       ├── index.ts            # Zustand store
│       └── domains.ts          # Domain-specific store slices
│
├── cli/                        # CLI tool (separate entry point)
│   ├── index.ts
│   └── commands/
│       ├── log.ts
│       ├── report.ts
│       └── export.ts
│
├── memory/                     # Agent memory system (see MEMORY-SYSTEM.md)
│   ├── active-context.md
│   ├── architecture-decisions.md
│   ├── current-focus.md
│   ├── failures-and-lessons.md
│   ├── weekly-reviews/
│   └── snapshots/
│
├── docs/                       # Project documentation
│   ├── ARCHITECTURE.md
│   └── MEMORY-SYSTEM.md
│
├── tests/                      # Test files
│   ├── analytics/
│   ├── components/
│   └── e2e/
│
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
└── vitest.config.ts
```

---

## 19. API Design

### Event API

```
POST /api/events
  Body: {
    domainId: string,
    value: number,
    note?: string,
    timestamp?: string (default: now)
  }
  Response: { id: string, ...event }

GET /api/events?domainId=deep-work&from=2024-01-01&to=2024-12-31
  Response: { events: Event[], total: number }

DELETE /api/events/:id
  Response: { deleted: true }
```

### Analytics API

```
GET /api/analytics/consistency/:domainId?weeks=8
  Response: {
    domainId: string,
    consistency: number,
    activeDays: number,
    totalDays: number,
    weeklyBreakdown: { week: string, consistency: number }[]
  }

GET /api/analytics/trend/:domainId?weeks=8
  Response: {
    direction: 'improving' | 'declining' | 'stable' | 'insufficient',
    slope: number,
    recentAverage: number,
    previousAverage: number
  }

GET /api/analytics/correlations?lagDays=0,1,2,3,7
  Response: {
    correlations: {
      domainA: string,
      domainB: string,
      pearsonR: number,
      lagDays: number,
      sampleSize: number
    }[]
  }

GET /api/analytics/burnout-risk
  Response: {
    risk: 'low' | 'moderate' | 'high',
    factors: {
      consistencyDrop: number,
      variability: number,
      moodTrend: number | null
    }
  }
```

### Domain API

```
GET /api/domains
  Response: { domains: Domain[] }

POST /api/domains
  Body: {
    id: string,
    label: string,
    icon?: string,
    unit?: string,
    type: 'numeric' | 'scale',
    min?: number,
    max?: number
  }
  Response: { domain: Domain }

PATCH /api/domains/:id
  Body: { label?: string, icon?: string, ... }
  Response: { domain: Domain }
```

### Response Format

```typescript
interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

interface Event {
  id: string;
  domainId: string;
  timestamp: string;  // ISO 8601
  value: number;
  note: string | null;
  source: string;
  createdAt: string;
}

interface Domain {
  id: string;
  label: string;
  icon: string | null;
  unit: string | null;
  type: 'numeric' | 'boolean' | 'scale';
  minValue: number;
  maxValue: number;
  archived: boolean;
}
```

---

## 20. Example Data Models

### Event Examples

```json
{
  "id": "evt_01j5f8a",
  "domainId": "deep-work",
  "timestamp": "2024-11-15T09:00:00.000Z",
  "value": 7.5,
  "note": "Built correlation matrix module. Flow state was good.",
  "source": "manual"
}
```

```json
{
  "id": "evt_01j5f8b",
  "domainId": "sleep",
  "timestamp": "2024-11-15T06:30:00.000Z",
  "value": 6.5,
  "note": "Woke up once around 3am. Fitbit: 6h42m",
  "source": "manual"
}
```

```json
{
  "id": "evt_01j5f8c",
  "domainId": "gym",
  "timestamp": "2024-11-15T12:00:00.000Z",
  "value": 8.0,
  "note": "Upper body. Felt strong. +5kg on bench.",
  "source": "cli"
}
```

### Domain Configuration Examples

```json
[
  {
    "id": "deep-work",
    "label": "Deep Work",
    "icon": "🧠",
    "unit": "hours",
    "type": "numeric",
    "minValue": 0,
    "maxValue": 12
  },
  {
    "id": "sleep",
    "label": "Sleep",
    "icon": "🌙",
    "unit": "hours",
    "type": "numeric",
    "minValue": 0,
    "maxValue": 12
  },
  {
    "id": "gym",
    "label": "Training",
    "icon": "💪",
    "unit": "sessions",
    "type": "numeric",
    "minValue": 0,
    "maxValue": 2
  },
  {
    "id": "icpc",
    "label": "ICPC Practice",
    "icon": "⚡",
    "unit": "problems",
    "type": "numeric",
    "minValue": 0,
    "maxValue": 20
  },
  {
    "id": "mood",
    "label": "Mood",
    "icon": "🎯",
    "unit": null,
    "type": "scale",
    "minValue": 1,
    "maxValue": 10
  },
  {
    "id": "reading",
    "label": "Reading",
    "icon": "📚",
    "type": "numeric",
    "minValue": 0,
    "maxValue": 5,
    "unit": "hours"
  }
]
```

---

## 21. Event Tracking Design

### Event Structure

Every event in the system follows this structure:

```typescript
interface RawEvent {
  id: string;           // Auto-generated UUID
  domainId: string;     // References domain config
  timestamp: string;    // ISO 8601. When the event occurred.
  value: number;        // Numeric value. Scale-normalized.
  note?: string;        // Optional human context. Max 280 chars.
  source: EventSource;  // How the event entered the system
  createdAt: string;    // When the event was recorded
}

type EventSource = 'manual' | 'cli' | 'telegram' | 'api' | 'integration';
```

### Ingestion Channels (Priority Order)

1. **In-app quick-log** — Primary. Web UI.
2. **CLI** (`lq log deep-work 7`) — For terminal-native users.
3. **Telegram bot** — Async logging from phone.
4. **API** — For scripted or automated logging.
5. **Integrations** — GitHub (commits → deep work proxy), Calendar (events → time blocks).

### Event Integrity Rules

- Events are immutable after creation. No UPDATE. Only DELETE (undo).
- Timestamps are user-local timezone, stored as ISO 8601 with offset.
- Value must be within domain's min/max range. Rejected server-side if out of range.
- Duplicate detection: Same domain + timestamp + value within 60s → deduplicate silently.
- Max 1 note per event. Notes are not indexed (privacy). Not sent to LLM unless user opts in.

### Event Sourcing Benefits

- **Time travel.** Compute "what did my heatmap look like 3 weeks ago?" from raw events.
- **Audit trail.** Every data point has a source and timestamp. No silent overwrites.
- **Analytics flexibility.** Add new metrics without backfilling. Old events remain valid.
- **Sync-friendly.** Events are append-only. Merging two databases is `UNION ALL` + dedup.

---

## 22. Future Monetization Potential

### Principles

- Not building for monetization now.
- But architecture should not prevent reasonable future options.
- Personal analytics is a sensitive domain. Monetization must respect trust.

### Potential Models (If Ever Monetized)

| Model | Feasibility | Risk |
|---|---|---|
| One-time license fee | High | Low willingness to pay for solo tools |
| Subscription (cloud sync + AI) | Medium | Requires cloud infra. Privacy concerns. |
| Consulting / coaching data | Low | Scope creep. Distracts from product. |
| Open source + donations | High | Aligns with solo dev. No pressure. |

### Recommendation

Stay free and open source for the foreseeable future. If monetization happens, it should be for **sync infrastructure** (cloud database for multi-device) or **premium AI compute** (more sophisticated analysis). Never monetize user data.

---

## 23. Security/Privacy Considerations

### Design Principles

- **Data is the user's property.** The system is a tool, not a data collector.
- **Local-first by default.** No data leaves the machine unless the user explicitly syncs.
- **Minimal data in transit.** If cloud sync is added, E2E encrypt or use trusted zero-knowledge providers.
- **No telemetry.** The app does not phone home. No analytics cookies. No usage tracking.

### Implementation

| Concern | Solution |
|---|---|
| Data storage | SQLite file on local filesystem. User controls file location. |
| API auth | No auth for local-only. For cloud: JWT or session token. |
| Notes privacy | Notes are never sent to LLM without explicit user action. |
| Export security | Export is JSON file. User controls storage and sharing. |
| Input validation | All API inputs validated with Zod. SQL injection prevented by parameterized queries. |
| XSS | React's default escaping. No `dangerouslySetInnerHTML`. |
| CSP | Strict Content-Security-Policy header in Next.js config. |

### Data Retention

- Events: Permanent (append-only archive)
- Weekly snapshots: Permanent (computed cache, recomputable from events)
- Correlations: Auto-purged if recomputed (replaced on next computation)
- Agent memory: User-managed (can delete individual entries)
- LLM interaction logs: Never stored by the system. User's LLM provider may log.

---

## 24. Local-First vs Cloud Tradeoffs

### Local-First (MVP Choice)

| Pro | Con |
|---|---|
| Zero latency. Instant load. | Single-device. No sync. |
| Offline by default. | Data loss if no backup. |
| No servers to manage. | No web access from other devices. |
| Total privacy. | Sharing/export requires manual steps. |
| $0 infrastructure cost. | .sqlite file must be backed up manually. |

### Cloud (Future Option)

| Pro | Con |
|---|---|
| Multi-device sync. | Requires server ($$, maintenance). |
| Data accessible anywhere. | Privacy concerns. |
| Backup is automatic. | Latency for every interaction. |
| Enables mobile PWA off-device. | Auth complexity. |

### Hybrid Recommendation

Start local-first. Add optional cloud sync as a Phase 5+ feature.

Sync mechanism if added:
- Events are append-only → conflict resolution is trivial (union + dedup)
- Use CRDT-inspired approach: last-writer-wins per event
- Cloud DB is PostgreSQL. Local is SQLite. Sync via API.

---

## 25. Deployment Architecture

### MVP (Local-Only)

```
┌─────────────────────┐
│   Developer Machine │
│                     │
│  npm run dev        │
│  ├── Next.js :3000  │
│  └── SQLite file    │
│       └── data.db   │
└─────────────────────┘
```

No deployment needed. Run locally.

### Phase 2 (Optional Self-Host)

```
┌─────────────────────┐     ┌─────────────────┐
│   VPS / Railway     │     │  SQLite volume    │
│                     │     │  (persistent)     │
│  npm run build      │     │                  │
│  npm start          │     │  data.db         │
└─────────────────────┘     └─────────────────┘
```

One Docker container. SQLite file mounted as volume.
Or: Simple Railway/Fly.io deployment for $5-7/month.

### Phase 3 (With Cloud Sync)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Browser     │     │  Next.js     │     │  PostgreSQL  │
│  (PWA)       │────▶│  (Vercel)    │────▶│  (Neon/RDS)  │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  AI Service  │
                     │  (OpenAI /   │
                     │   Ollama)    │
                     └──────────────┘
```

---

## Appendix A: Key Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Scope creep** (adding too many domains/features) | High | High | Anti-feature list. Ruthless MVP scoping. |
| **Abandonment** (losing interest after initial build) | Medium | High | Dogfood daily. Keep MVP small enough to ship in 2 weeks. |
| **SQLite concurrency issues** (if cloud sync added) | Medium | Medium | Use WAL mode. Events are append-only. |
| **Heatmap performance** (rendering years of data) | Low | Medium | SVG virtualization. Only render visible viewport. |
| **Correlation misinterpretation** (user sees false patterns) | Medium | Low | Always show sample size and significance. Never claim causation. |
| **LLM prompt injection via notes** | Low | Medium | Notes are not sent to LLM automatically. User approves weekly review. |

## Appendix B: Dependencies & Sizing

| Package | Purpose | Bundle Size Impact |
|---|---|---|
| next | Framework | ~100kb (server) |
| react + react-dom | UI | ~40kb |
| zustand | State | ~2kb |
| better-sqlite3 | Database | ~500kb (native) |
| drizzle-orm | ORM | ~30kb |
| drizzle-kit | Migrations | Dev only |
| date-fns | Date math | ~5kb (tree-shakeable) |
| recharts | Charts | ~20kb |
| zod | Validation | ~8kb |
| commander | CLI | ~10kb |

**Total deps:** 10 production packages. Minimal. Deliberate.

---

*This document is a living design artifact. Update as decisions are made and lessons are learned.*

*See [MEMORY-SYSTEM.md](./MEMORY-SYSTEM.md) for the agent memory architecture.*
