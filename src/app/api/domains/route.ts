import { NextResponse } from "next/server";
import { db, schema } from "@/src/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createDomainSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  icon: z.string().optional(),
  unit: z.string().optional(),
  type: z.enum(["numeric", "boolean", "scale"]).optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
});

// GET /api/domains — List all domains
export async function GET() {
  try {
    const results = await db
      .select()
      .from(schema.domains)
      .where(eq(schema.domains.archived, false))
      .all();

    return NextResponse.json({ data: { domains: results } });
  } catch (error) {
    console.error("Failed to fetch domains:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch domains" } },
      { status: 500 }
    );
  }
}

// POST /api/domains — Create a new domain
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createDomainSchema.parse(body);

    const domain = {
      id: parsed.id,
      label: parsed.label,
      icon: parsed.icon || null,
      unit: parsed.unit || null,
      type: parsed.type || "numeric",
      minValue: parsed.minValue ?? 0,
      maxValue: parsed.maxValue ?? 10,
      createdAt: new Date().toISOString(),
      archived: false,
    };

    await db.insert(schema.domains).values(domain);

    return NextResponse.json({ data: { domain } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: error.message } },
        { status: 400 }
      );
    }
    console.error("Failed to create domain:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create domain" } },
      { status: 500 }
    );
  }
}
