import { NextResponse } from "next/server";
import { seed } from "@/src/lib/seed";

// POST /api/seed — Seed the database with default domains and sample data
export async function POST() {
  try {
    await seed();
    return NextResponse.json({ data: { seeded: true } });
  } catch (error) {
    console.error("Seed failed:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Seed failed" } },
      { status: 500 }
    );
  }
}
