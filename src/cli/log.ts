#!/usr/bin/env tsx
/**
 * Life Quant Dashboard — CLI Quick Logger
 *
 * Usage:
 *   npx tsx src/cli/log.ts <domain> <value> [note] [options]
 *
 * Examples:
 *   npx tsx src/cli/log.ts deep-work 3.5 "focus session"
 *   npx tsx src/cli/log.ts sleep 7.5
 *   npx tsx src/cli/log.ts mood 8 --date 2024-12-25
 *   npx tsx src/cli/log.ts --list
 *   npx tsx src/cli/log.ts              (interactive mode)
 */

import { db, schema } from "../lib/db";
import { eq, and } from "drizzle-orm";
import { createInterface } from "readline";
import { exit, argv } from "process";

// ─── Helpers ──────────────────────────────────────────────────────────

function bold(text: string): string {
  return `\x1b[1m${text}\x1b[22m`;
}

function dim(text: string): string {
  return `\x1b[2m${text}\x1b[22m`;
}

function green(text: string): string {
  return `\x1b[32m${text}\x1b[39m`;
}

function red(text: string): string {
  return `\x1b[31m${text}\x1b[39m`;
}

function yellow(text: string): string {
  return `\x1b[33m${text}\x1b[39m`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Help ─────────────────────────────────────────────────────────────

function printHelp() {
  console.log(`
${bold("Life Quant — CLI Quick Logger")}

${dim("Log an event directly to your local database.")}

${bold("Usage:")}
  npx tsx src/cli/log.ts ${dim("<domain> <value> [note] [options]")}

${bold("Positional arguments:")}
  domain    Domain id or label (e.g., "deep-work", "Deep Work")
  value     Numeric value (e.g., 3.5, 8, 1)
  note      Optional context (max 280 chars)

${bold("Options:")}
  --list                  List all available domains
  --date <YYYY-MM-DD>     Set event date (default: today)
  --time <HH:MM>          Set event time (default: now)
  --help, -h              Show this help

${bold("Examples:")}
  npx tsx src/cli/log.ts deep-work 3.5 "focus session"
  npx tsx src/cli/log.ts sleep 7.5 ${dim("(logs note inline: \"sleep 7.5\")")}
  npx tsx src/cli/log.ts mood 8 --date 2024-12-25
  npx tsx src/cli/log.ts --list
`);
}

// ─── List domains ─────────────────────────────────────────────────────

async function listDomains() {
  const domains = await db
    .select()
    .from(schema.domains)
    .where(eq(schema.domains.archived, false))
    .all();

  if (domains.length === 0) {
    console.log("No domains found. Run the seed script first:");
    console.log(dim("  npx tsx src/lib/seed.ts\n"));
    return;
  }

  console.log(`\n${bold("Available domains:")}\n`);

  // Column widths
  const idWidth = Math.max(...domains.map((d) => d.id.length), 4);

  for (const d of domains) {
    const range =
      d.type === "boolean"
        ? "0/1"
        : `${d.minValue ?? 0}–${d.maxValue ?? 10}`;
    console.log(
      `  ${(d.icon ?? "  ") + " "}${bold(d.id.padEnd(idWidth))}  ${dim(
        `${d.label}  (${range}${d.unit ? " " + d.unit : ""})`
      )}`
    );
  }
  console.log();
}

// ─── Find domain ──────────────────────────────────────────────────────

async function findDomain(query: string) {
  const q = query.toLowerCase().trim();

  // Try exact id match first
  let domain = await db
    .select()
    .from(schema.domains)
    .where(
      and(
        eq(schema.domains.id, q),
        eq(schema.domains.archived, false)
      )
    )
    .get();

  if (domain) return domain;

  // Try case-insensitive label match
  const all = await db
    .select()
    .from(schema.domains)
    .where(eq(schema.domains.archived, false))
    .all();

  domain = all.find(
    (d) =>
      d.id.toLowerCase() === q ||
      d.label.toLowerCase() === q ||
      d.label.toLowerCase().includes(q)
  );

  if (domain) return domain;

  // Fuzzy: if query partially matches
  const partial = all.filter(
    (d) =>
      d.id.includes(q) ||
      d.label.toLowerCase().includes(q)
  );

  if (partial.length === 1) return partial[0];

  if (partial.length > 1) {
    console.error(red(`❌ Multiple domains match "${query}":`));
    for (const d of partial) {
      console.error(`   ${d.icon ?? ""} ${d.id} (${d.label})`);
    }
    return null;
  }

  console.error(red(`❌ Domain not found: "${query}"`));
  console.error(dim(`   Run --list to see available domains.\n`));
  return null;
}

// ─── Interactive mode ─────────────────────────────────────────────────

function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    })
  );
}

async function interactiveMode() {
  console.log(`\n${bold("Quick Log — Interactive")}${dim("  (Ctrl+C to cancel)")}\n`);

  // Show domains
  await listDomains();

  const domainInput = await prompt(`${bold("Domain:")} `);
  if (!domainInput.trim()) {
    console.log(red("Cancelled."));
    return;
  }

  const domain = await findDomain(domainInput.trim());
  if (!domain) return;

  let value: number | null = null;
  while (value === null) {
    const raw = await prompt(
      `${bold("Value:")} ${dim(`(${domain.minValue ?? 0}–${domain.maxValue ?? 10})`)} `
    );
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      const min = domain.minValue ?? 0;
      const max = domain.maxValue ?? 10;
      if (domain.type === "boolean") {
        if (raw.trim() === "y" || raw.trim() === "yes" || raw.trim() === "1") value = 1;
        else if (raw.trim() === "n" || raw.trim() === "no" || raw.trim() === "0") value = 0;
        else console.log(yellow("  Enter y/n or 0/1"));
      } else if (parsed < min || parsed > max) {
        console.log(yellow(`  Value must be between ${min} and ${max}`));
      } else {
        value = parsed;
      }
    } else {
      console.log(yellow("  Enter a number"));
    }
  }

  const note = await prompt(`${bold("Note:")} ${dim("(optional) ")}`);
  const noteStr = note.trim().slice(0, 280) || undefined;

  console.log(); // spacing before summary

  await logEvent(domain.id, value, noteStr);
}

// ─── Log event ────────────────────────────────────────────────────────

async function logEvent(
  domainId: string,
  value: number,
  note?: string,
  dateStr?: string,
  timeStr?: string
) {
  const now = new Date();
  let timestamp: string;

  if (dateStr) {
    if (timeStr) {
      timestamp = `${dateStr}T${timeStr}:00.000Z`;
    } else {
      timestamp = `${dateStr}T${now.toISOString().slice(11, 19)}.000Z`;
    }
  } else {
    timestamp = now.toISOString();
  }

  // Clamp value to domain bounds
  const domain = await db
    .select()
    .from(schema.domains)
    .where(eq(schema.domains.id, domainId))
    .get();

  if (!domain) {
    console.error(red(`❌ Domain "${domainId}" not found.`));
    exit(1);
  }

  const min = domain.minValue ?? 0;
  const max = domain.maxValue ?? 10;
  const clampedValue = Math.max(min, Math.min(max, value));

  if (clampedValue !== value) {
    console.log(yellow(`  ⚠ Value clamped to ${clampedValue} (range: ${min}–${max})`));
  }

  const finalValue =
    domain.type === "boolean" ? (clampedValue >= 1 ? 1 : 0) : clampedValue;

  const id = crypto.randomUUID();

  await db
    .insert(schema.events)
    .values({
      id,
      domainId,
      timestamp,
      value: finalValue,
      note: note ?? null,
      source: "cli",
    })
    .run();

  const displayLabel = domain.icon
    ? `${domain.icon} ${domain.label}`
    : domain.label;
  const displayValue =
    domain.type === "boolean"
      ? finalValue === 1
        ? green("Yes")
        : red("No")
      : `${finalValue}${domain.unit ? ` ${domain.unit}` : ""}`;
  const dateDisplay = formatDate(new Date(timestamp));

  console.log(`  ${green("✓")} ${bold(displayLabel)} logged: ${bold(String(displayValue))}`);
  console.log(`    ${dim(dateDisplay)}`);
  if (note) console.log(`    "${dim(note)}"`);
  console.log();

  return { id, timestamp };
}

// ─── Main ─────────────────────────────────────────────────────────────

async function main() {
  const args = argv.slice(2);

  // ── Help ────────────────────────────────────────────────────────────
  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  // ── List ────────────────────────────────────────────────────────────
  if (args.includes("--list")) {
    await listDomains();
    return;
  }

  // ── Interactive ────────────────────────────────────────────────────
  if (args.length === 0) {
    await interactiveMode();
    return;
  }

  // ── Positional arguments ───────────────────────────────────────────
  const domainInput = args[0];
  const valueInput = args[1];
  const noteInput = args.slice(2).find((a) => !a.startsWith("--"));

  // Flags
  let dateStr: string | undefined;
  let timeStr: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--date" && i + 1 < args.length) {
      dateStr = args[i + 1];
    }
    if (args[i] === "--time" && i + 1 < args.length) {
      timeStr = args[i + 1];
    }
  }

  if (!domainInput || valueInput === undefined) {
    console.error(red("❌ Missing arguments."));
    console.error(dim("   Usage: npx tsx src/cli/log.ts <domain> <value> [note]"));
    console.error(dim("   Run --help for details.\n"));
    exit(1);
  }

  const parsedValue = parseFloat(valueInput);
  if (isNaN(parsedValue)) {
    console.error(red(`❌ Invalid value: "${valueInput}"`));
    exit(1);
  }

  const domain = await findDomain(domainInput);
  if (!domain) exit(1);

  await logEvent(domain.id, parsedValue, noteInput, dateStr, timeStr);
}

main().catch((err) => {
  console.error(red("❌ Error:"), err instanceof Error ? err.message : String(err));
  exit(1);
});
