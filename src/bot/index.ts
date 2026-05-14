#!/usr/bin/env tsx
/**
 * Life Quant Dashboard — Telegram Bot
 *
 * Long-polling bot for logging events via Telegram.
 *
 * Usage:
 *   1. Set BOT_TOKEN in .env (get from @BotFather)
 *   2. npx tsx src/bot/index.ts
 *   3. Send commands to your bot on Telegram
 *
 * Commands:
 *   /log <domain> <value> [note]  — Log an event
 *   /domains                      — List tracked domains
 *   /help                         — Show this help
 *   /start                        — Welcome message
 */

import { db, schema } from "../lib/db";
import { eq, and } from "drizzle-orm";
import { config } from "dotenv";

config(); // Load .env

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN not set in .env file");
  console.error("   Get a token from @BotFather on Telegram");
  console.error("   Then add it to .env: BOT_TOKEN=your_token_here");
  process.exit(1);
}

// ─── Bot setup ──────────────────────────────────────────────────────────

import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ─── Helpers ────────────────────────────────────────────────────────────

function bold(text: string): string {
  return `<b>${escapeHtml(text)}</b>`;
}

function code(text: string): string {
  return `<code>${escapeHtml(text)}</code>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ─── Domain lookup ──────────────────────────────────────────────────────

async function findDomain(query: string) {
  const q = query.toLowerCase().trim();

  // Try exact id match first
  let domain = await db
    .select()
    .from(schema.domains)
    .where(
      and(eq(schema.domains.id, q), eq(schema.domains.archived, false))
    )
    .get();

  if (domain) return domain;

  // Fetch all non-archived domains for JS-side matching
  const all = await db
    .select()
    .from(schema.domains)
    .where(eq(schema.domains.archived, false))
    .all();

  // Case-insensitive label match
  domain = all.find(
    (d) =>
      d.id.toLowerCase() === q ||
      d.label.toLowerCase() === q ||
      d.label.toLowerCase().includes(q)
  );
  if (domain) return domain;

  // Partial/fuzzy match
  const partial = all.filter(
    (d) => d.id.includes(q) || d.label.toLowerCase().includes(q)
  );

  if (partial.length === 1) return partial[0];

  return null;
}

async function listDomainsMarkdown(): Promise<string> {
  const domains = await db
    .select()
    .from(schema.domains)
    .where(eq(schema.domains.archived, false))
    .all();

  if (domains.length === 0) {
    return "No domains configured. Run the seed script first:\n" + code("npx tsx src/lib/seed.ts");
  }

  let result = "📋 <b>Available domains:</b>\n\n";
  for (const d of domains) {
    const range =
      d.type === "boolean" ? "0/1" : `${d.minValue ?? 0}–${d.maxValue ?? 10}`;
    result += `${d.icon ?? "•"} <b>${escapeHtml(d.id)}</b> — ${escapeHtml(d.label)} (${range}${d.unit ? " " + escapeHtml(d.unit) : ""})\n`;
  }
  result += "\nUsage: " + code("/log <domain> <value> [note]");
  return result;
}

// ─── Log event ──────────────────────────────────────────────────────────

async function logEvent(
  domainId: string,
  value: number,
  note?: string
): Promise<{
  success: boolean;
  message: string;
  domain?: { icon: string | null; label: string; unit: string | null; type: string };
  finalValue?: number;
  timestamp?: string;
}> {
  const domain = await db
    .select()
    .from(schema.domains)
    .where(eq(schema.domains.id, domainId))
    .get();

  if (!domain) {
    return { success: false, message: `Domain "${domainId}" not found.` };
  }

  const min = domain.minValue ?? 0;
  const max = domain.maxValue ?? 10;
  const clampedValue = Math.max(min, Math.min(max, value));

  const finalValue =
    domain.type === "boolean" ? (clampedValue >= 1 ? 1 : 0) : clampedValue;

  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  await db
    .insert(schema.events)
    .values({
      id,
      domainId,
      timestamp,
      value: finalValue,
      note: note ?? null,
      source: "telegram",
    })
    .run();

  const displayLabel = domain.icon
    ? `${domain.icon} ${domain.label}`
    : domain.label;
  const displayValue =
    domain.type === "boolean"
      ? finalValue === 1
        ? "Yes"
        : "No"
      : `${finalValue}${domain.unit ? ` ${domain.unit}` : ""}`;

  const clampedWarning =
    clampedValue !== value
      ? `\n⚠️ Value clamped to ${clampedValue} (range: ${min}–${max})`
      : "";

  return {
    success: true,
    message: `✅ ${displayLabel}: ${bold(String(displayValue))}${clampedWarning}`,
    domain: { icon: domain.icon, label: domain.label, unit: domain.unit, type: domain.type },
    finalValue,
    timestamp,
  };
}

// ─── Command handlers ──────────────────────────────────────────────────

// /start
bot.onText(/^\/start$/, async (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from?.first_name ?? "there";

  await bot.sendMessage(
    chatId,
    `Hey ${escapeHtml(name)}! 👋

I'm your <b>Life Quant</b> logging bot. I help you track your daily activities directly from Telegram.

${bold("Commands:")}
${code("/log <domain> <value> [note]")}  — Log an event
${code("/domains")}                      — List tracked domains
${code("/help")}                         — Show this help

${bold("Examples:")}
${code("/log deep-work 3.5 focus session")}
${code("/log sleep 7.5")}
${code("/log mood 8 feeling great")}

Get started: ${code("/domains")} to see what you can track.`,
    { parse_mode: "HTML" }
  );
});

// /help
bot.onText(/^\/help$/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
    `<b>Life Quant — Help</b>

${bold("Usage:")}
${code("/log <domain> <value> [note]")}

${bold("Arguments:")}
• <b>domain</b> — Domain id or name (e.g., deep-work, Deep Work)
• <b>value</b>  — Numeric value (e.g., 3.5, 8, 1)
• <b>note</b>   — Optional context (max 280 chars)

${bold("Options:")}
${code("/domains")}  — List all available domains
${code("/help")}     — Show this message
${code("/start")}    — Welcome screen

${bold("Examples:")}
${code("/log deep-work 3.5 focus session")}
${code("/log sleep 7.5")}
${code("/log gym 1 morning workout")}
${code("/log mood 8")}

💡 <b>Tip:</b> You can use domain names or IDs.
   e.g., both ${code("/log deep-work 3")} and ${code("/log Deep Work 3")} work.`,
    { parse_mode: "HTML" }
  );
});

// /domains
bot.onText(/^\/domains$/, async (msg) => {
  const chatId = msg.chat.id;
  const text = await listDomainsMarkdown();
  await bot.sendMessage(chatId, text, { parse_mode: "HTML" });
});

// /log <domain> <value> [note]
bot.onText(/^\/log\s+(.+)$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const input = match![1].trim();

  // Parse: domain value [note...]
  // Support both "domain value note" and "domain value" formats
  const parts = input.split(/\s+/);
  
  if (parts.length < 2) {
    await bot.sendMessage(
      chatId,
      `⚠️ Usage: ${code("/log <domain> <value> [note]")}

Example: ${code("/log deep-work 3.5 focus session")}`,
      { parse_mode: "HTML" }
    );
    return;
  }

  // Parse domain — could be multi-word (e.g., "Deep Work")
  // Strategy: try to find domain matching from the start
  let domainInput: string;
  let valueStr: string;
  let noteInput: string | undefined;

  // Try first word as domain id first
  const firstWord = parts[0];
  const firstDomain = await findDomain(firstWord);

  if (firstDomain) {
    domainInput = firstWord;
    valueStr = parts[1];
    noteInput = parts.slice(2).join(" ") || undefined;
  } else {
    // Try first two words as domain label (e.g., "Deep Work")
    const twoWords = parts.slice(0, 2).join(" ");
    const twoWordDomain = await findDomain(twoWords);
    if (twoWordDomain) {
      domainInput = twoWords;
      valueStr = parts[2];
      noteInput = parts.slice(3).join(" ") || undefined;
    } else {
      // Use first word as domain, let findDomain give the error
      domainInput = firstWord;
      valueStr = parts[1];
      noteInput = parts.slice(2).join(" ") || undefined;
    }
  }

  if (!valueStr) {
    await bot.sendMessage(
      chatId,
      `⚠️ Missing value. Usage: ${code("/log <domain> <value> [note]")}`,
      { parse_mode: "HTML" }
    );
    return;
  }

  const parsedValue = parseFloat(valueStr);
  if (isNaN(parsedValue)) {
    await bot.sendMessage(
      chatId,
      `⚠️ Invalid value: "${escapeHtml(valueStr)}". Please enter a number.`,
      { parse_mode: "HTML" }
    );
    return;
  }

  // Find the domain
  const domain = await findDomain(domainInput);
  if (!domain) {
    // Show available domains
    const domainsText = await listDomainsMarkdown();
    await bot.sendMessage(
      chatId,
      `⚠️ Domain "${escapeHtml(domainInput)}" not found.

${domainsText}`,
      { parse_mode: "HTML" }
    );
    return;
  }

  // Log the event
  const result = await logEvent(domain.id, parsedValue, noteInput);

  if (result.success) {
    await bot.sendMessage(chatId, result.message, { parse_mode: "HTML" });
  } else {
    await bot.sendMessage(chatId, `❌ ${escapeHtml(result.message)}`, {
      parse_mode: "HTML",
    });
  }
});

// Fallback for unrecognized messages
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  // Ignore commands handled above and non-text messages
  if (!text || text.startsWith("/")) return;

  // Show hint for unrecognized messages
  await bot.sendMessage(
    chatId,
    `Not sure what to do. Try:
${code("/log <domain> <value> [note]")}  — Log an event
${code("/domains")}                      — List domains
${code("/help")}                         — Show help`,
    { parse_mode: "HTML" }
  );
});

// ─── Startup ────────────────────────────────────────────────────────────

(async () => {
  const me = await bot.getMe();
  console.log("🤖 Life Quant Telegram Bot started!");
  console.log(`   Bot username: @${me.username}`);
  console.log("   Polling for messages... (Ctrl+C to stop)");
})();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down bot...");
  bot.stopPolling();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nShutting down bot...");
  bot.stopPolling();
  process.exit(0);
});
