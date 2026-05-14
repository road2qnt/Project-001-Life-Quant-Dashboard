import { db, schema } from "./db";

const DEFAULT_DOMAINS = [
  {
    id: "deep-work",
    label: "Deep Work",
    icon: "🧠",
    unit: "hours",
    type: "numeric" as const,
    minValue: 0,
    maxValue: 12,
  },
  {
    id: "sleep",
    label: "Sleep",
    icon: "🌙",
    unit: "hours",
    type: "numeric" as const,
    minValue: 0,
    maxValue: 12,
  },
  {
    id: "gym",
    label: "Training",
    icon: "💪",
    unit: "sessions",
    type: "numeric" as const,
    minValue: 0,
    maxValue: 2,
  },
  {
    id: "icpc",
    label: "ICPC Practice",
    icon: "⚡",
    unit: "problems",
    type: "numeric" as const,
    minValue: 0,
    maxValue: 20,
  },
  {
    id: "mood",
    label: "Mood",
    icon: "🎯",
    unit: null,
    type: "scale" as const,
    minValue: 1,
    maxValue: 10,
  },
  {
    id: "reading",
    label: "Reading",
    icon: "📚",
    unit: "hours",
    type: "numeric" as const,
    minValue: 0,
    maxValue: 5,
  },
];

function generateSampleEvents() {
  const events: (typeof schema.events.$inferInsert)[] = [];
  const now = new Date();

  for (let day = 0; day < 60; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);

    const dayStr = date.toISOString().slice(0, 10);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    // Deep work: 2-8 hours on weekdays, 0-3 on weekends
    const dwValue = isWeekend
      ? Math.random() > 0.5
        ? Math.floor(Math.random() * 3) + 1
        : 0
      : Math.floor(Math.random() * 6) + 2;

    if (dwValue > 0) {
      events.push({
        id: crypto.randomUUID(),
        domainId: "deep-work",
        timestamp: `${dayStr}T${String(9 + Math.floor(Math.random() * 4)).padStart(2, "0")}:00:00.000Z`,
        value: dwValue,
        note: null,
        source: "manual",
        createdAt: date.toISOString(),
      });
    }

    // Sleep: 5-9 hours
    const sleepValue = Math.floor(Math.random() * 4) + 5;
    events.push({
      id: crypto.randomUUID(),
      domainId: "sleep",
      timestamp: `${dayStr}T${String(6 + Math.floor(Math.random() * 2)).padStart(2, "0")}:00:00.000Z`,
      value: sleepValue,
      note: null,
      source: "manual",
      createdAt: date.toISOString(),
    });

    // Mood: 4-9, correlated with sleep
    const moodValue = Math.min(9, Math.max(4, Math.floor(sleepValue - 3 + Math.random() * 3)));
    events.push({
      id: crypto.randomUUID(),
      domainId: "mood",
      timestamp: `${dayStr}T${String(12 + Math.floor(Math.random() * 4)).padStart(2, "0")}:00:00.000Z`,
      value: moodValue,
      note: null,
      source: "manual",
      createdAt: date.toISOString(),
    });

    // Gym: 0-1 session, 4x per week on weekdays
    if (!isWeekend && Math.random() > 0.5) {
      events.push({
        id: crypto.randomUUID(),
        domainId: "gym",
        timestamp: `${dayStr}T${String(7 + Math.floor(Math.random() * 2)).padStart(2, "0")}:00:00.000Z`,
        value: 1,
        note: null,
        source: "manual",
        createdAt: date.toISOString(),
      });
    }

    // Reading: 0-2 hours
    const readingValue = Math.random() > 0.4 ? Math.floor(Math.random() * 2) + 1 : 0;
    if (readingValue > 0) {
      events.push({
        id: crypto.randomUUID(),
        domainId: "reading",
        timestamp: `${dayStr}T${String(20 + Math.floor(Math.random() * 2)).padStart(2, "0")}:00:00.000Z`,
        value: readingValue,
        note: null,
        source: "manual",
        createdAt: date.toISOString(),
      });
    }
  }

  return events;
}

export async function seed() {
  console.log("🌱 Seeding database...");

  // Insert domains (batch)
  const domainValues = DEFAULT_DOMAINS.map((d) => ({
    ...d,
    createdAt: new Date().toISOString(),
    archived: false,
  }));
  await db
    .insert(schema.domains)
    .values(domainValues)
    .onConflictDoNothing({ target: schema.domains.id })
    .run();
  console.log(`✓ Inserted ${DEFAULT_DOMAINS.length} domains`);

  // Insert sample events (batch)
  const events = generateSampleEvents();
  for (let i = 0; i < events.length; i += 100) {
    const batch = events.slice(i, i + 100);
    await db
      .insert(schema.events)
      .values(batch)
      .onConflictDoNothing({ target: schema.events.id })
      .run();
  }
  console.log(`✓ Inserted ${events.length} sample events`);

  console.log("✅ Seed complete!");
}

// Run if executed directly
if (process.argv[1]?.includes("seed")) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}
