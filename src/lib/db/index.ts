import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Local SQLite file (CLI/bot/seed) OR remote Turso (Vercel + multi-device).
// Turso wins if TURSO_URL is set; otherwise fall back to a local file path.
const tursoUrl = process.env.TURSO_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl && !process.env.DB_PATH) {
  // Default local file path for dev without Turso configured
  process.env.DB_PATH = "data.db";
}

const client = createClient(
  tursoUrl
    ? { url: tursoUrl, authToken: tursoAuthToken }
    : { url: process.env.DB_PATH! }
);

export const db = drizzle(client, { schema });
export { schema };
