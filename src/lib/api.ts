// ─── Types ────────────────────────────────────────────────────────────

export interface Domain {
  id: string;
  label: string;
  icon: string | null;
  unit: string | null;
  type: "numeric" | "boolean" | "scale";
  minValue: number;
  maxValue: number;
  archived: boolean;
}

export interface EventItem {
  id: string;
  domainId: string;
  timestamp: string;
  value: number;
  note: string | null;
  source: string;
  createdAt: string;
}

export interface ConsistencyResponse {
  domainId: string;
  consistency: number;
  activeDays: number;
  totalDays: number;
  avgValue: number;
  trend: "improving" | "declining" | "stable" | "insufficient";
  weeklyBreakdown: { weekStart: string; consistency: number }[];
}

export interface DailyValue {
  date: string; // YYYY-MM-DD
  value: number;
  count: number; // number of events on this day
}

// ─── API Client ───────────────────────────────────────────────────────

const BASE = "";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(`${BASE}${url}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json();
}

export async function fetchDomains(): Promise<Domain[]> {
  const res = await fetchJson<{ data: { domains: Domain[] } }>("/api/domains");
  return res.data.domains;
}

export async function fetchEvents(
  domainId: string,
  from: string,
  to: string
): Promise<EventItem[]> {
  const params = new URLSearchParams({ domainId, from, to, limit: "1000" });
  const res = await fetchJson<{ data: { events: EventItem[] } }>(
    `/api/events?${params}`
  );
  return res.data.events;
}

export async function fetchConsistency(
  domainId: string
): Promise<ConsistencyResponse> {
  const res = await fetchJson<{ data: ConsistencyResponse }>(
    `/api/analytics/consistency/${domainId}`
  );
  return res.data;
}

export async function postEvent(
  domainId: string,
  value: number,
  note?: string
): Promise<EventItem> {
  const res = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domainId, value, note }),
  });
  if (!res.ok) throw new Error("Failed to create event");
  const json = await res.json();
  return json.data;
}

// ─── Helpers ──────────────────────────────────────────────────────────

export function computeDailyValues(
  events: EventItem[],
  maxValue: number
): Map<string, DailyValue> {
  const daily = new Map<string, DailyValue>();

  for (const event of events) {
    const date = event.timestamp.slice(0, 10);
    const existing = daily.get(date);
    if (existing) {
      existing.value = Math.min(maxValue, existing.value + event.value);
      existing.count++;
    } else {
      daily.set(date, { date, value: Math.min(maxValue, event.value), count: 1 });
    }
  }

  return daily;
}

export function getHeatmapLevel(
  value: number,
  maxValue: number
): 0 | 1 | 2 | 3 | 4 {
  if (value <= 0 || maxValue <= 0) return 0;
  const ratio = value / maxValue;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}


