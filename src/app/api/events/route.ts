import { NextResponse } from "next/server";
import { db, schema } from "@/src/lib/db";
import { eq, and, between, desc } from "drizzle-orm";
import { z } from "zod";

const createEventSchema = z.object({
  domainId: z.string().min(1),
  value: z.number(),
  note: z.string().max(280).optional(),
  timestamp: z.string().optional(),
  source: z.enum(["manual", "cli", "telegram", "api", "integration"]).optional(),
});

// POST /api/events — Log a new event
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createEventSchema.parse(body);

    const event = {
      id: crypto.randomUUID(),
      domainId: parsed.domainId,
      timestamp: parsed.timestamp || new Date().toISOString(),
      value: parsed.value,
      note: parsed.note || null,
      source: parsed.source || "manual",
      createdAt: new Date().toISOString(),
    };

    await db.insert(schema.events).values(event);

    return NextResponse.json({ data: event }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: error.message } },
        { status: 400 }
      );
    }
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create event" } },
      { status: 500 }
    );
  }
}

// GET /api/events — Query events
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get("domainId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const limit = Math.min(Number(searchParams.get("limit")) || 100, 1000);
    const offset = Number(searchParams.get("offset")) || 0;

    const conditions = [];
    if (domainId) conditions.push(eq(schema.events.domainId, domainId));
    if (from && to) conditions.push(between(schema.events.timestamp, from, to));

    const query = db
      .select()
      .from(schema.events)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.events.timestamp))
      .limit(limit)
      .offset(offset);

    const results = await query;

    return NextResponse.json({
      data: { events: results, total: results.length },
    });
  } catch (error) {
    console.error("Failed to query events:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to query events" } },
      { status: 500 }
    );
  }
}
