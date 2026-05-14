import { NextResponse } from "next/server";
import { db, schema } from "@/src/lib/db";
import { and, eq, gte, lte } from "drizzle-orm";
import { consistencyScore, weeklyConsistencyScores, trendDirection } from "@/src/lib/analytics";

// GET /api/analytics/consistency/:domainId?weeks=8
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ domainId: string }> }
) {
  try {
    const { domainId } = await params;
    const weeks = 8;

    // Compute date range
    const now = new Date();
    const from = new Date(now);
    from.setDate(from.getDate() - weeks * 7);
    const fromStr = from.toISOString().slice(0, 10);
    const toStr = now.toISOString().slice(0, 10);

    // Fetch events for the domain in the date range
    const events = await db
      .select({
        value: schema.events.value,
        timestamp: schema.events.timestamp,
      })
      .from(schema.events)
      .where(
        and(
          gte(schema.events.timestamp, fromStr),
          lte(schema.events.timestamp, toStr),
          eq(schema.events.domainId, domainId)
        )
      )
      .all();

    // Get domain config for maxValue
    const domain = await db
      .select({
        maxValue: schema.domains.maxValue,
        label: schema.domains.label,
      })
      .from(schema.domains)
      .where(eq(schema.domains.id, domainId))
      .get();

    if (!domain) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Domain not found" } },
        { status: 404 }
      );
    }

    const maxValue = domain.maxValue ?? 10;
    const totalDays = weeks * 7;

    const result = consistencyScore(events, totalDays, maxValue);
    const weekly = weeklyConsistencyScores(events, maxValue, weeks);
    const trend = trendDirection(weekly.map((w) => w.consistency));

    return NextResponse.json({
      data: {
        domainId,
        consistency: result.consistency,
        activeDays: result.activeDays,
        totalDays: result.totalDays,
        avgValue: result.avgValue,
        trend,
        weeklyBreakdown: weekly,
      },
    });
  } catch (error) {
    console.error("Failed to compute consistency:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to compute consistency" } },
      { status: 500 }
    );
  }
}
