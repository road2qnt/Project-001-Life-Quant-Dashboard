# Agent Memory Architecture — Life Quant Dashboard

> **Document Status:** Active Design v0.1
> **Last Updated:** $(date +%Y-%m-%d)
> **System Type:** AI-native persistent engineering memory

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Memory System Design](#2-memory-system-design)
3. [Context Persistence Strategy](#3-context-persistence-strategy)
4. [Markdown Dump Architecture](#4-markdown-dump-architecture)
5. [Obsidian Integration Workflow](#5-obsidian-integration-workflow)
6. [Automatic Summarization Pipeline](#6-automatic-summarization-pipeline)
7. [Session Continuity Protocol](#7-session-continuity-protocol)
8. [Long-Context Compression Strategies](#8-long-context-compression-strategies)
9. [Knowledge Graph Possibilities](#9-knowledge-graph-possibilities)
10. [Retrieval Strategies](#10-retrieval-strategies)
11. [Context Aging / Pruning Logic](#11-context-aging--pruning-logic)
12. [Semantic Indexing Design](#12-semantic-indexing-design)
13. [Human-Readable + AI-Readable Formatting Standards](#13-human-readable--ai-readable-formatting-standards)
14. [Folder Structure & Naming Conventions](#14-folder-structure--naming-conventions)
15. [Template Files](#15-template-files)
16. [Implementation Phases](#16-implementation-phases)
17. [Compression Heuristics](#17-compression-heuristics)
18. [Retrieval Heuristics](#18-retrieval-heuristics)
19. [Token Optimization Strategies](#19-token-optimization-strategies)

---

## 1. Design Philosophy

### Problem Statement

LLM context windows are ephemeral. Every new agent session starts with zero knowledge. Previously resolved issues, architectural decisions, and debugging discoveries must be re-explained. This is wasteful, error-prone, and breaks engineering continuity.

### Core Insight

**Memory is not logging.** Writing everything down is not memory — it's noise. Memory is selective, structured, and retrievable. The system must discriminate between:

| Category | Store? | How? |
|---|---|---|
| Architectural decisions | Permanently | `architecture-decisions.md` — ADR format |
| TODO priorities | Until completed | `current-focus.md` — rolling priority list |
| Mistakes & failures | Permanently | `failures-and-lessons.md` — never redact mistakes |
| Session chat logs | Never | Ephemeral. Summarize only. |
| Reasoning chains | Until conclusion | Summarized into decision record |
| Low-signal conversation | Never | Filtered out entirely |

### Operating Principles

1. **Information density over volume.** Every line in every file must carry signal.
2. **Write-once, read-many.** Memory files are written by agents, read by future agents (and the human).
3. **Self-summarizing.** Old entries are compressed, not deleted.
4. **Retrieval-optimized.** Naming, structure, and metadata support both human browsing and machine search.
5. **Low ceremony.** Writing to memory should take <30 seconds for an agent. No complex tooling.

### What Makes This Different from Generic Note-Taking

| Generic Notes | This System |
|---|---|
| Chronological dumping ground | Structured by topic + priority |
| No expiration logic | Explicit TTLs and compression rules |
| Human-only readability | Dual-format (human + AI readable) |
| Passive collection | Active generation after key events |
| No retrieval optimization | File names, headers, and metadata are search-first |
| No deduplication | Fingerprinting + dedup of repeated information |

---

## 2. Memory System Design

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Memory System Architecture                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                    TRIGGERS                           │    │
│  │                                                      │    │
│  │  Session Start    Architecture     Implementation     │    │
│  │  Session End      Change           Milestone          │    │
│  │  Debug Discovery  Weekly Review    Manual Request     │    │
│  └──────────┬──────────────────────────────┬────────────┘    │
│             │                              │                 │
│             ▼                              ▼                 │
│  ┌──────────────────┐          ┌─────────────────────┐      │
│  │  Reader Agent     │          │   Writer Agent       │      │
│  │  (session init)   │          │   (after event)      │      │
│  └────────┬─────────┘          └──────────┬──────────┘      │
│           │                                │                 │
│           ▼                                ▼                 │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              MEMORY LAYER (filesystem)                │    │
│  │                                                      │    │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐  │    │
│  │  │ Active  │ │Arch      │ │Failures │ │Snapshots │  │    │
│  │  │ Context │ │Decisions │ │& Lessons│ │          │  │    │
│  │  └─────────┘ └──────────┘ └─────────┘ └──────────┘  │    │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────────────────┐  │    │
│  │  │ Weekly  │ │ Decision │ │ Agent Handoff        │  │    │
│  │  │ Reviews │ │ Journal  │ │ Protocol             │  │    │
│  │  └─────────┘ └──────────┘ └──────────────────────┘  │    │
│  └──────────────────────────────────────────────────────┘    │
│                         │                                     │
│                         ▼                                     │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              CONSUMERS                                │    │
│  │  Future AI Agents    Human (Obsidian)    RAG/Vector   │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### Trigger Events

Memory writes are triggered by specific events, not by timers:

| Trigger | Action | File |
|---|---|---|
| **Session start** | Read `active-context.md` + `agent-handoff.md` into context | — |
| **Session end** | Write compressed summary to `agent-handoff.md`, update `active-context.md` | Both |
| **Architecture decision** | Append to `architecture-decisions.md` with ADR format | ADR file |
| **Implementation milestone** | Update `current-focus.md`, archive old items | Current focus |
| **Bug/debug discovery** | Append to `failures-and-lessons.md` | Failures file |
| **Weekly (automatic)** | Generate `weekly-reviews/week-YYYY-MM-DD.md` | Weekly review |
| **Human request** | Generate snapshot on demand | `snapshots/` |

---

## 3. Context Persistence Strategy

### What Gets Stored Permanently

- **Architecture decisions** (ADRs) — never deleted, only superseded
- **Failures and lessons** — never deleted, only appended
- **Weekly reviews** — permanent archive
- **Design documents** (`docs/`) — permanent

### What Gets Stored Until Superseded

- **Active context** — overwritten each session
- **Current focus** — replaced when priorities shift
- **Agent handoff** — overwritten each handoff

### What Gets Summarized Then Expired

- **Session logs** → summarized into `agent-handoff.md`
- **Debugging sessions** → key findings → `failures-and-lessons.md`
- **Long reasoning chains** → compressed ADR → `architecture-decisions.md`

### What Never Gets Stored

- Raw chat logs
- Transient back-and-forth
- Repeated reasoning patterns
- Low-confidence speculation

### TTL Table

| Artifact | TTL | Action on Expiry |
|---|---|---|
| `active-context.md` | Replaced each session | Old version archived in `snapshots/` |
| `current-focus.md` | Until priorities change | Completed items moved to `weekly-reviews/` |
| `agent-handoff.md` | Replaced each session | Content merged into weekly review |
| `architecture-decisions.md` | Permanent | Superseded ADRs marked `[SUPERSEDED]` |
| `failures-and-lessons.md` | Permanent | No expiry, append only |
| Weekly reviews | Permanent | No expiry, organized by date |
| Snapshots | 90 days | Auto-purged, summarized into monthly |

---

## 4. Markdown Dump Architecture

### Format Specification

Every memory file follows this structure:

```markdown
# File Name

> **Metadata:**
> - Created: 2024-11-15
> - Last Updated: 2024-11-20
> - Status: Active | Archived | Superseded
> - Tags: #architecture #decision #database

## Body

Content organized by headers (## ### ####).

## References

- [Architecture Decision: SQLite over PostgreSQL](../docs/ARCHITECTURE.md#24-local-first-vs-cloud-tradeoffs)
- [Related Failure: Data loss on migration](#)

## Changelog

- 2024-11-20: Updated consistency formula
- 2024-11-15: Initial draft
```

### Metadata Schema

```yaml
# Frontmatter format for machine parsing
---
id: mem-001
type: adr
status: active
created: 2024-11-15
updated: 2024-11-20
tags:
  - architecture
  - decision
  - database
supersedes: []
superseded_by: []
related_issues: []
token_estimate: 420
---
```

### Dual-Format Principle

- **Headings and structure** → Human readable (Obsidian, Markdown renderer)
- **Metadata frontmatter** → AI readable (parsed by agents, RAG systems)
- **Consistent header hierarchy** → Both readable, enables tree-of-thought navigation

---

## 5. Obsidian Integration Workflow

### Symlink Strategy

```bash
# Link the memory directory into Obsidian vault
ln -s /path/to/project/memory /path/to/obsidian-vault/life-quant-memory

# Or for cross-platform:
# On Windows: mklink /D C:\obsidian\life-quant-memory C:\project\memory
```

### Obsidian-Specific Features

| Obsidian Feature | Usage |
|---|---|
| Backlinks `[[wikilinks]]` | Cross-reference ADRs, failures, decisions |
| Graph view | Visualize memory connections |
| Daily notes | Not used. Memory system replaces daily notes. |
| Tags | `#architecture #decision #database #lesson #review` |
| Templates | Store in Obsidian's template folder |
| Dataview plugin | Query memory files by metadata |
| Search | Full-text across all memory files |

### Workflow

1. Project's `memory/` is symlinked into Obsidian vault
2. Agent writes structured markdown files
3. Human views, edits, links in Obsidian
4. Agent reads human edits back on next session
5. Dataview queries enable cross-cutting views (e.g., all decisions tagged `#database`)

---

## 6. Automatic Summarization Pipeline

### Design

```
Trigger Event
    │
    ▼
┌────────────────┐
│ Quality Filter  │──→ Yes ──→ Summarize ──→ Write to Memory
│                 │
│ Is this worth   │
│ remembering?    │──→ No ──→ Discard
│ Criteria:       │
│ - New decision? │
│ - New mistake?  │
│ - Priority      │
│   change?       │
│ - Milestone?    │
└────────────────┘
```

### Summarization Rules

| Input | Output | Compression Ratio |
|---|---|---|
| 30-min debugging session | 3-line failure record | ~100:1 |
| Architecture discussion | ADR entry (5-10 lines) | ~50:1 |
| Session chat log | Handoff summary (10-20 lines) | ~20:1 |
| Weekly review | Compressed monthly summary | ~5:1 |

### Compression Heuristics

- Remove all false starts ("actually", "wait", "let me think")
- Collapse repeated reasoning into single statement
- Extract only: decision, rationale, alternatives considered, outcome
- Remove `I/you/we` — use imperative or passive voice
- Preserve numbers (metrics, dates, scores)

---

## 7. Session Continuity Protocol

### Session Start (New Agent)

```
1. Read /memory/active-context.md
   → "What is the current state of the project?"

2. Read /memory/agent-handoff.md
   → "What was the last session working on?"

3. Read /memory/architecture-decisions.md (last 3 entries)
   → "What key decisions are most relevant?"

4. Read /memory/current-focus.md
   → "What are the current priorities?"

5. (Optional) Search /memory/failures-and-lessons.md for relevant tags
   → "What mistakes should I avoid repeating?"
```

### Session End (Current Agent)

```
1. Write /memory/agent-handoff.md
   → "What was accomplished? What's next? What's blocked?"

2. Update /memory/active-context.md
   → "What's the current project state?"

3. Append to /memory/architecture-decisions.md (if applicable)
   → "What decisions were made?"

4. Append to /memory/failures-and-lessons.md (if applicable)
   → "What went wrong? What was learned?"

5. Update /memory/current-focus.md
   → "What are the updated priorities?"

6. (If milestone) Generate snapshot
   → "Capture current state for future reference"
```

### Handoff Template

The `agent-handoff.md` file is THE most critical file for session continuity.

```markdown
# Agent Handoff — YYYY-MM-DD

## Session Summary

- **Duration:** 2h
- **Focus:** Database schema design
- **Files Modified:** src/lib/db/schema.ts, src/lib/db/index.ts

## Accomplished

1. Designed event-sourced database schema (6 tables)
2. Implemented Drizzle schema definitions
3. Created migration pipeline

## Current State

- Events table functional: ✓
- Domains table functional: ✓
- Analytics engine: NOT STARTED

## Next Actions (Priority Order)

1. [P0] Implement consistency scoring function
2. [P0] Build heatmap component
3. [P1] Build quick-log widget

## Blockers

- None currently

## Decisions Made

- `events` table is append-only (no updates)
- Use UUID v7 for event IDs (time-sortable)

## Technical Debt / Risks

- Analytics engine needs unit tests before shipping
- SQLite WAL mode not yet configured (needed for concurrent reads)

## Key Metrics

- Event log entries: 0 (no real data yet)
- Passing tests: 0 (no tests written yet)
- Open PRs: 0

## References

- [Architecture Decision: Event Sourcing](architecture-decisions.md#adr-001-event-sourced-data-model)
```

---

## 8. Long-Context Compression Strategies

### Strategy 1: Rolling Summary

For files that grow over time (`failures-and-lessons.md`, `architecture-decisions.md`):

```
┌──────────────────────────────────────────┐
│  File Content                             │
│                                           │
│  ┌────────────────────────────────────┐  │
│  │ Recent entries (full detail)       │  │  ← Last 5 entries
│  │   - Entry 1                        │  │
│  │   - Entry 2                        │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ Older entries (compressed)         │  │  ← Beyond 5, single line each
│  │   - Entry 3 [2024-10-01]: Chose X  │  │
│  │   - Entry 4 [2024-09-15]: Chose Y  │  │
│  │   - Entry 5 [2024-09-01]: Chose Z  │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ Ancient entries (archived)         │  │  ← Beyond 20, moved to archive
│  │   See /memory/archive/decisions/   │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### Strategy 2: Semantic Compression

Instead of "I tried approach A but it failed because B, then I tried approach C and it worked because D":

```markdown
- **Problem:** [one line]
- **Tried:** [one line]
- **Failed because:** [one line]
- **Solution:** [one line]
- **Key insight:** [one line]
```

### Strategy 3: Archive-and-Index

When files exceed 50 entries:
1. Move entries 21+ to `archive/` (gzip by default)
2. Leave an index in the main file with dates and one-line summaries
3. Full text remains retrievable on demand

---

## 9. Knowledge Graph Possibilities

### Current (Lightweight)

- Backlinks in markdown `[[wikilinks]]`
- Tags in metadata
- References section at bottom of each file

### Future (Phase 3+)

- Extract entities from memory files → build graph
- Node types: `Decision`, `Failure`, `Feature`, `Bug`, `Integration`
- Edge types: `led_to`, `superseded`, `caused`, `blocked_by`, `related_to`
- Visualize in Obsidian graph view
- Agent queries graph: "What decisions led to the current architecture?"

### Graph Schema (Future)

```typescript
interface GraphNode {
  id: string;
  type: 'decision' | 'failure' | 'feature' | 'bug' | 'milestone';
  label: string;
  date: string;
  tags: string[];
  file: string; // reference to markdown file
}

interface GraphEdge {
  source: string;  // node id
  target: string;  // node id
  type: 'led_to' | 'superseded' | 'caused' | 'blocked' | 'related';
  description: string;
}
```

### Recommendation

Skip the graph for MVP. Obsidian's built-in backlinks + graph view are sufficient for a solo project. Add custom graph if/when nodes exceed 100.

---

## 10. Retrieval Strategies

### Strategy 1: Grep

For a solo project, `grep -r "keyword" memory/` is the fastest retrieval method.

```bash
# Find all decisions about database
grep -r "database" memory/architecture-decisions.md

# Find all lessons about SQLite
grep -r "SQLite" memory/failures-and-lessons.md

# Find files by tag
grep -r "tags:.*#database" memory/
```

### Strategy 2: File Name Search

File names encode the content type and date:

```
architecture-decisions.md      → All ADRs
failures-and-lessons.md        → All failures
weekly-reviews/week-2024-11-15 → Specific week
snapshots/v0.1.0-mvp.md        → Specific version
```

### Strategy 3: Metadata Query (Future)

When files exceed 50+, add a simple index file:

```markdown
# Memory Index

## Decisions
| ID | Date | Title | Status |
|---|---|---|---|
| ADR-001 | 2024-11-15 | Event Sourcing | Active |
| ADR-002 | 2024-11-16 | SQLite over PG | Active |

## Failures
| Date | Problem | Category |
|---|---|---|
| 2024-11-17 | Data loss on migration | Migration |
```

### Strategy 4: RAG / Vector Search (Future)

- Embed each memory file section using `text-embedding-3-small`
- Store in SQLite with `sqlite-vec` extension
- Query: "How do I handle data migration issues?"
- Returns: "See failure entry 2024-11-17: Data loss on migration"

### Recommendation for MVP

Grep + file name search. That's it. RAG adds infrastructure complexity with little benefit at <100 entries.

---

## 11. Context Aging / Pruning Logic

### When to Prune

- **File exceeds 50 entries** → Archive oldest 30 entries
- **Entry older than 90 days** → Compress to one line
- **Entry tagged `ephemeral`** → Delete after 7 days
- **File not modified in 30 days** → Review for archiving

### Pruning Rules

| Condition | Action |
|---|---|
| New ADR entry #51+ | Archive entries 1-30 to `archive/decisions-001-030.md` |
| New failure entry #26+ | Compress entries 1-15 to single-line summaries |
| Weekly review older than 3 months | Move to `archive/weekly-reviews/` |
| Snapshot older than 90 days | Delete (recreatable from git history) |
| `current-focus.md` stale (>14 days no update) | Flag for human review |

### Automation

Pruning is NOT automatic for MVP. It's a manual maintenance task.

After Phase 2, add a `npm run memory:prune` script that:
1. Counts entries per file
2. Moves old entries to archive
3. Generates index
4. Reports savings

---

## 12. Semantic Indexing Design

### MVP Approach

Manual tagging via frontmatter:

```yaml
---
tags:
  - architecture
  - database
  - sqlite
---
```

### Phase 2 Approach

Auto-tagging via keyword matching:

```typescript
const tagMap: Record<string, string[]> = {
  'sqlite|postgres|database|schema|migration': ['database'],
  'consistency|score|trend|correlation|analytics': ['analytics'],
  'ai|llm|openai|ollama|insight': ['ai'],
  'error|bug|failed|mistake|crash|issue': ['failure'],
};
```

### Phase 3 Approach (Future)

- Embed each section with `text-embedding-3-small` → 1536-dim vector
- Store in `memory_index` SQLite table with `sqlite-vec`
- Query: "What did we decide about event sourcing?"
- Result: ADR-001 with similarity score

---

## 13. Human-Readable + AI-Readable Formatting Standards

### Human-Readable Rules

1. **Headings** describe content clearly
2. **Bullet points** for lists (not prose paragraphs)
3. **Tables** for structured data
4. **Code blocks** for technical details
5. **Bold** for key terms
6. **Links** for cross-references
7. **Max 80 char line width** (readable in terminal)

### AI-Readable Rules

1. **Consistent heading hierarchy** `# → ## → ### → ####`
2. **YAML frontmatter** with machine-parseable metadata
3. **One idea per bullet** (not compound bullets)
4. **ISO 8601 dates** everywhere
5. **Explicit status markers** `Active | Superseded | Archived`
6. **Reference links** use full paths, not relative (`file.md#section`)

### Example: Both Humans and AI Happy

```markdown
---
id: adr-003
type: decision
status: active
created: 2024-11-18
tags: [analytics, consistency, scoring]
---

## ADR-003: Consistency Score Formula

**Decision:** Use `(active_days / total_days) * (avg_value / max_value)` as the primary consistency metric.

**Rationale:**
- Penalizes both absence AND low effort — solves streak problem
- Normalized to [0, 1] for cross-domain comparison
- Computable in O(n) from raw events

**Alternatives Considered:**
1. [Rejected] Simple streak count — rewards showing up, not effort
2. [Rejected] Binary on/off — loses intensity signal
3. [Rejected] Exponential decay — too complex, hard to explain

**Tradeoffs:**
- Does not weight recent days more heavily
- Solution: Add `recentWeight` parameter in Phase 2
```

---

## 14. Folder Structure & Naming Conventions

```
memory/
├── active-context.md              # Current project state (ALWAYS read first)
├── current-focus.md               # Current priorities and next actions
├── agent-handoff.md               # Last session summary (for session continuity)
├── architecture-decisions.md      # All ADRs, append-only
├── failures-and-lessons.md        # All mistakes and learnings, append-only
├── decision-journal.md            # Personal reflections on decisions made
│
├── weekly-reviews/                # Auto-generated weekly summaries
│   ├── week-2024-11-15.md
│   ├── week-2024-11-22.md
│   └── ...
│
├── snapshots/                     # Point-in-time captures
│   ├── v0.1.0-mvp.md
│   └── ...
│
├── archive/                       # Compressed/archived entries
│   ├── decisions-001-030.md
│   ├── failures-001-015.md
│   └── weekly-reviews/
│
└── templates/                     # Templates for generating new entries
    ├── adr-template.md
    ├── failure-template.md
    ├── weekly-review-template.md
    └── handoff-template.md
```

### Naming Conventions

| File Type | Pattern | Example |
|---|---|---|
| Active context | `active-context.md` | Fixed name, overwritten |
| Current focus | `current-focus.md` | Fixed name, updated |
| Agent handoff | `agent-handoff.md` | Fixed name, overwritten |
| ADRs | `architecture-decisions.md` | Single file, append-only |
| Failures | `failures-and-lessons.md` | Single file, append-only |
| Weekly reviews | `week-YYYY-MM-DD.md` | Date-based |
| Snapshots | `v{major}.{minor}.{patch}-{label}.md` | Version-based |

---

## 15. Template Files

### ADR Template

```markdown
---
id: adr-{NNN}
type: decision
status: active | superseded
created: {YYYY-MM-DD}
updated: {YYYY-MM-DD}
tags: []
supersedes: []
superseded_by: []
---

## ADR-{NNN}: {Title}

**Context:**
{What problem required a decision?}

**Decision:**
{What was chosen?}

**Rationale:**
{Why this choice over alternatives}

**Alternatives Considered:**
1. [Accepted/Rejected] {Alternative} — {reason}
2. [Accepted/Rejected] {Alternative} — {reason}

**Tradeoffs:**
- {Consequence 1}
- {Consequence 2}
```

### Failure Template

```markdown
---
id: fail-{NNN}
type: failure
created: {YYYY-MM-DD}
tags: []
related_decision: []
---

## Failure: {Title}

**What happened:**
{What went wrong?}

**Root cause:**
{Why did it happen?}

**Impact:**
{What was the cost? (time, data, frustration)}

**Resolution:**
{How was it fixed?}

**Prevention:**
{How to avoid this in the future}
```

### Weekly Review Template

```markdown
---
id: week-{YYYY-MM-DD}
type: review
created: {YYYY-MM-DD}
tags: [weekly-review]
---

# Weekly Review — {Date Range}

## Metrics
- Total events logged: {N}
- Domains active: {N}
- Consistency change: {+/-}%

## Highlights
{Key wins or discoveries}

## Lowlights
{Key failures or setbacks}

## Patterns Detected
{Behavioral observations}

## Next Week Focus
{Priorities for upcoming week}

## Decisions Made
{Links to any ADRs created}
```

### Snapshot Template

```markdown
---
id: snapshot-{version}
type: snapshot
created: {YYYY-MM-DD}
version: {v0.1.0}
tags: [snapshot]
---

# Snapshot: {Version} — {YYYY-MM-DD}

## Project State
- Working features: {list}
- Pending features: {list}
- Known bugs: {list}
- Tests passing: {N}/{N}

## Architecture Summary
{One paragraph summary of current architecture}

## Active Decisions
{Links to relevant ADRs}

## Current Priorities
{From current-focus.md}

## Risks
{Open risks}
```

---

## 16. Implementation Phases

### Phase 1: Foundation (Week 1)

- [ ] Create `memory/` directory structure
- [ ] Create template files
- [ ] Create initial `active-context.md` and `current-focus.md`
- [ ] Document in README

### Phase 2: Agent Integration (Week 2)

- [ ] Add session start/end protocol to agent prompts
- [ ] Implement handoff generation
- [ ] Implement ADR writing on decision events
- [ ] Implement failure recording on error events

### Phase 3: Automation (Week 4+)

- [ ] `npm run memory:snapshot` — generate snapshot
- [ ] `npm run memory:prune` — archive old entries
- [ ] Auto-generate weekly review from analytics data

### Phase 4: Advanced (Future)

- [ ] Embeddings + vector search
- [ ] Knowledge graph extraction
- [ ] Obsidian Dataview queries
- [ ] Memory health dashboard (token usage, entry count, staleness)

---

## 17. Compression Heuristics

### Compression by Type

| Content Type | Raw Tokens | Compressed | Ratio | Method |
|---|---|---|---|---|
| ADR (new) | ~500 | ~300 | 1.7x | Remove alternatives that were obviously bad |
| Failure entry | ~400 | ~150 | 2.7x | Keep only: root cause + prevention |
| Weekly review | ~800 | ~400 | 2x | Remove duplicate observations |
| Handoff | ~600 | ~300 | 2x | Keep only: next actions + blockers |
| Session log | ~2000 | ~400 | 5x | Discard everything except decisions + failures |

### Compression Rules

1. **Remove greeting/farewell.** "Hi, how can I help?" → nothing
2. **Remove false starts.** "Actually, let me reconsider..." → nothing
3. **Remove repetition.** Same point made twice → keep first instance. ("I already said this but..." → nothing)
4. **Remove hedging.** "I think maybe we could potentially..." → "Do X"
5. **Preserve numbers.** "We spent about 2 hours..." → `duration: 2h`
6. **Preserve exact quotes of errors.** "Error: Cannot read property 'x' of undefined" → preserved verbatim
7. **Collapse alternatives.** "We considered A, B, C. A won because X." → keep only the chosen option + key alternatives
8. **One line per insight.** No prose paragraphs. Bullet points only.

### Token Budget

| File | Target Size | Max Before Pruning |
|---|---|---|
| `active-context.md` | ~300 tokens | 500 tokens |
| `current-focus.md` | ~200 tokens | 300 tokens |
| `agent-handoff.md` | ~400 tokens | 600 tokens |
| `architecture-decisions.md` | ~3000 tokens total | ~5000 tokens → prune |
| `failures-and-lessons.md` | ~2000 tokens total | ~4000 tokens → prune |

---

## 18. Retrieval Heuristics

### How an Agent Should Read Memory

| Step | Action | Cost |
|---|---|---|
| 1 | Read `active-context.md` | ~300 tokens |
| 2 | Read `current-focus.md` | ~200 tokens |
| 3 | Read `agent-handoff.md` | ~400 tokens |
| 4 | Read last 3 entries of `architecture-decisions.md` | ~500 tokens |
| 5 | Grep `failures-and-lessons.md` for relevant keywords | ~100 tokens (grep) |
| **Total retrieval cost** | | **~1500 tokens** |

### When to Read More

| Situation | Additional Files |
|---|---|
| Starting work on new feature | Full `architecture-decisions.md` |
| Debugging | Full `failures-and-lessons.md` |
| Weekly review | `weekly-reviews/` for last 4 weeks |
| New architecture decision | All ADRs related to domain |

### What NOT to Read

- Don't read the entire `memory/` directory
- Don't read archive files unless referenced
- Don't read weekly reviews older than 4 weeks
- Don't read snapshots older than current version

---

## 19. Token Optimization Strategies

### Strategy 1: Terse by Default

Write memory entries like engineering notes, not prose:

```
❌ "After careful consideration of multiple alternatives, we have decided to use
SQLite as our database solution because it offers superior performance for
single-user scenarios and eliminates the need for infrastructure management."

✅ "Decision: SQLite. Reason: Single-user, zero infra, instant setup."
```

### Strategy 2: Frontmatter Compression

Parse metadata from YAML, don't store redundant info:

```
❌
id: adr-001
type: architecture-decision-record
status: currently-active-and-in-effect
created-date: 2024-11-15

✅
id: adr-001
type: adr
status: active
created: 2024-11-15
```

### Strategy 3: Reference Instead of Duplicate

Don't repeat context that exists elsewhere:

```
❌ "As we decided in ADR-001, we are using SQLite..."

✅ "See: [ADR-001](architecture-decisions.md#adr-001-event-sourced-data-model)"
```

### Strategy 4: Tables Over Lists

Tables compress better than lists for structured data:

```
❌
- Feature A: Implemented
- Feature B: In Progress
- Feature C: Planned

✅
| Feature | Status |
|---|---|
| A | Done |
| B | WIP |
| C | Planned |
```

### Strategy 5: Active Voice, No Fluff

```
❌ "The system was designed by us to be able to..."

✅ "System designed to..."
```

---

## Appendix A: Initial Memory Files

The following files should be created immediately as the scaffold:

1. `memory/active-context.md` — Current state of memory system setup
2. `memory/current-focus.md` — Initial priorities
3. `memory/agent-handoff.md` — Empty handoff (first session)
4. `memory/architecture-decisions.md` — Initial ADRs from ARCHITECTURE.md
5. `memory/failures-and-lessons.md` — Empty (no failures yet)
6. `memory/templates/*.md` — All templates

## Appendix B: Maintenance Schedule

| Task | Frequency | Automation |
|---|---|---|
| Update `current-focus.md` | Each session | Manual (agent writes) |
| Write ADR for decisions | On decision | Manual (agent writes) |
| Generate weekly review | Weekly | Automated from analytics |
| Prune archive files | Monthly | Script (npm run) |
| Review memory health | Monthly | Manual inspection |
| Update templates | As needed | Manual |

---

*This document is a living design artifact. Update as the memory system evolves.*

*See [ARCHITECTURE.md](./ARCHITECTURE.md) for the main engineering plan.*
