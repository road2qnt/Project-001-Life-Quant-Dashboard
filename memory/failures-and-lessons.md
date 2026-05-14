---
id: failures-index
type: index
status: active
created: 2025-01-15
updated: 2025-05-14
tags: [failures, index]
token_estimate: 50
---

# Failures & Lessons

> Every mistake is a permanent record. Never deleted. Never redacted.
> Learn once, avoid forever.

| # | Date | Problem | Category | Severity |
|---|---|---|---|---|
| 1 | 2025-05-14 | Telegram bot 409 Conflict — multiple instances polling | Deployment | Medium |
| 2 | 2025-05-14 | Top-level await in CJS module | Build | Low |
| 3 | 2025-05-14 | Unnecessary type cast `false as unknown as boolean` | TypeScript | Low |
| 4 | 2025-05-14 | Toast timer leak (missing cleanup on unmount) | React | Low |
| 5 | 2025-05-14 | Operator precedence bug in midpoint calculation | Logic | Low |

---

---

id: fail-001
type: failure
created: 2025-05-14
tags: [deployment, telegram, bot]
related_decision: []
severity: medium
resolved: true

## Failure: Telegram Bot 409 Conflict

**What happened:** Bot started but didn't respond to messages. Telegram returned `409 Conflict: terminated by other getUpdates request`.

**Root cause:** Multiple bot instances running simultaneously. Earlier `timeout 10 npx tsx src/bot/index.ts` left orphaned processes. When a second instance started via `nohup`, both tried to poll the same Telegram API endpoint, causing Telegram to reject both.

**Impact:** ~15 minutes debugging. User couldn't use bot.

**Resolution:** Kill all bot processes (`pkill -f tsx.*bot`), restart single instance.

**Prevention:** Check for existing bot process before starting new one. Or use a PID file. Or use pm2 for process management.

---

---

id: fail-002
type: failure
created: 2025-05-14
tags: [build, typescript, commonjs]
severity: low
resolved: true

## Failure: Top-Level Await in CJS Module

**What happened:** `npx tsx src/bot/index.ts` threw `TransformError: Top-level await is currently not supported with the "cjs" output format`.

**Root cause:** `package.json` has no `"type": "module"`, so tsx uses CJS output. Top-level `await` (on `bot.getMe()`) is a syntax error in CJS.

**Impact:** Bot wouldn't start. ~5 minutes to debug and fix.

**Resolution:** Wrap startup logic in async IIFE: `(async () => { ... })();`

**Prevention:** Always wrap top-level `await` in async IIFE when using tsx in CJS mode. Or add `"type": "module"` to package.json (but breaks Next.js).

---

---

id: fail-003
type: failure
created: 2025-05-14
tags: [typescript, drizzle, type-safety]
severity: low
resolved: true

## Failure: Unnecessary Type Cast `false as unknown as boolean`

**What happened:** TypeScript type error when passing `false` to Drizzle's `eq()`. Fixed by casting `false as unknown as boolean`, which worked but was unnecessary and confusing.

**Root cause:** Drizzle column defined as `integer("archived", { mode: "boolean" })` — the type system was already boolean-compatible. The cast was cargo-culted.

**Impact:** None functionally. Code was uglier.

**Resolution:** Use plain `false` — Drizzle handles the boolean-to-integer conversion internally.

**Prevention:** Trust Drizzle's type system. Try plain values first before casting.

---

---

id: fail-004
type: failure
created: 2025-05-14
tags: [react, performance, cleanup]
severity: low
resolved: true

## Failure: Toast Timer Leak on Unmount

**What happened:** Toast auto-dismiss `setTimeout` could fire after component unmount, causing React state update warning.

**Root cause:** Timer ID stored in a local variable inside `useCallback`. `return () => clearTimeout(timer)` doesn't work in `useCallback` (it's not a `useEffect` cleanup).

**Impact:** Potential minor console warning. No functional impact.

**Resolution:** Use `useRef` to store timer ID, clean up in `useEffect` return.

**Prevention:** Always use `useRef` + `useEffect` cleanup for timers in React components.

---

---

id: fail-005
type: failure
created: 2025-05-14
tags: [logic, javascript, operators]
severity: low
resolved: true

## Failure: Operator Precedence Bug in Midpoint Calculation

**What happened:** `(domain?.minValue ?? 0 + domain?.maxValue ?? 10) / 2` evaluated to `0` instead of `5` for a domain with min=0, max=10.

**Root cause:** `??` has lower precedence than `+`. So `0 + domain?.maxValue` is evaluated first, then `domain?.minValue ?? (result)`. For min=0, the result is `(0) ?? (0 + 10 ?? 10)` = `0` because `0` is not nullish.

**Impact:** Boolean domains initialized to wrong value.

**Resolution:** Use explicit parentheses: `((domain?.minValue ?? 0) + (domain?.maxValue ?? 10)) / 2`

**Prevention:** Always parenthesize compound expressions with `??` and arithmetic operators.
