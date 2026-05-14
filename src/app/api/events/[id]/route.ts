import { NextResponse } from "next/server";
import { db, schema } from "@/src/lib/db";
import { eq } from "drizzle-orm";

// DELETE /api/events/:id — Delete/undo an event
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await db
      .delete(schema.events)
      .where(eq(schema.events.id, id))
      .run();

    if (result.changes === 0) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Event not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error("Failed to delete event:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete event" } },
      { status: 500 }
    );
  }
}
