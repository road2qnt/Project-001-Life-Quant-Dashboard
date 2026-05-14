import { NextResponse } from "next/server";
import { db, schema } from "@/src/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateDomainSchema = z.object({
  label: z.string().min(1).optional(),
  icon: z.string().optional(),
  unit: z.string().optional(),
  type: z.enum(["numeric", "boolean", "scale"]).optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  archived: z.boolean().optional(),
});

// PATCH /api/domains/:id — Update a domain
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateDomainSchema.parse(body);

    await db
      .update(schema.domains)
      .set({ ...parsed })
      .where(eq(schema.domains.id, id))
      .run();

    const updated = await db
      .select()
      .from(schema.domains)
      .where(eq(schema.domains.id, id))
      .get();

    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Domain not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { domain: updated } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: error.message } },
        { status: 400 }
      );
    }
    console.error("Failed to update domain:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update domain" } },
      { status: 500 }
    );
  }
}
