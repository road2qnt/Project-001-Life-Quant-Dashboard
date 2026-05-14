"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  fetchEvents,
  fetchDomains,
  computeDailyValues,
  type Domain,
  type DailyValue,
} from "@/src/lib/api";
import {
  consistencyScore,
  weeklyConsistencyScores,
  trendDirection,
} from "@/src/lib/analytics";
import { HeatmapCell } from "./HeatmapCell";
import { ConsistencyBadge } from "./ConsistencyBadge";

const CELL_SIZE = 12;
const CELL_GAP = 2;
const LABEL_WIDTH = 32;
const MONTH_LABEL_HEIGHT = 16;
const TOTAL_CELL_SIZE = CELL_SIZE + CELL_GAP;

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface HeatmapProps {
  domainId?: string;
  weeks?: number;
  refreshKey?: number;
  onLogClick?: (date: string) => void;
}

export function Heatmap({ domainId: initialDomainId, weeks = 52, refreshKey, onLogClick }: HeatmapProps) {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>(initialDomainId ?? "");
  const [events, setEvents] = useState<{ value: number; timestamp: string }[]>([]);
  const [dailyValues, setDailyValues] = useState<Map<string, DailyValue>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch domains on mount
  useEffect(() => {
    fetchDomains()
      .then((d) => {
        setDomains(d);
        if (!selectedDomain && d.length > 0) {
          setSelectedDomain(d[0].id);
        }
      })
      .catch((e) => setError(e.message));
  }, []);

  // Fetch events when domain changes (single fetch, compute everything client-side)
  useEffect(() => {
    if (!selectedDomain) return;

    setLoading(true);
    setError(null);

    const now = new Date();
    const from = new Date(now);
    from.setDate(from.getDate() - weeks * 7);
    const fromStr = from.toISOString().slice(0, 10);
    const toStr = now.toISOString().slice(0, 10);

    fetchEvents(selectedDomain, fromStr, toStr)
      .then((fetched) => {
        // Compute daily values
        const domain = domains.find((d) => d.id === selectedDomain);
        const maxValue = domain?.maxValue ?? 10;
        const daily = computeDailyValues(fetched, maxValue);

        setEvents(fetched);
        setDailyValues(daily);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [selectedDomain, weeks, refreshKey]);

  // ─── Compute consistency locally (no extra API call) ─────────────────

  const consistency = useMemo(() => {
    if (events.length === 0) return null;
    const domain = domains.find((d) => d.id === selectedDomain);
    const maxValue = domain?.maxValue ?? 10;
    const totalDays = weeks * 7;

    const result = consistencyScore(events, totalDays, maxValue);
    const weekly = weeklyConsistencyScores(events, maxValue, weeks);
    const trend = trendDirection(weekly.map((w) => w.consistency));

    return { ...result, trend, weeklyBreakdown: weekly };
  }, [events, domains, selectedDomain, weeks]);

  // ─── Compute the grid ────────────────────────────────────────────────

  const { grid, monthLabels } = useMemo(() => {
    const now = new Date();

    // Most recent Sunday = end of current week column
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() - endDate.getDay());

    // Start = end - weeks * 7 + 7  (aligns grid to start on a Sunday)
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - weeks * 7 + 7);

    const grid: { date: string; value: number; weekIdx: number; dayIdx: number }[] = [];
    const monthLabels: { label: string; x: number }[] = [];
    const seenMonths = new Set<string>();

    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + w * 7 + d);

        if (date > now) continue;

        const dateStr = date.toISOString().slice(0, 10);
        const dayValue = dailyValues.get(dateStr);
        const value = dayValue?.value ?? 0;

        grid.push({ date: dateStr, value, weekIdx: w, dayIdx: d });

        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (!seenMonths.has(monthKey)) {
          seenMonths.add(monthKey);
          monthLabels.push({
            label: MONTH_NAMES[date.getMonth()],
            x: LABEL_WIDTH + w * TOTAL_CELL_SIZE,
          });
        }
      }
    }

    return { grid, monthLabels };
  }, [dailyValues, weeks]);

  // ─── Domain change handler ───────────────────────────────────────────

  const handleDomainChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedDomain(e.target.value),
    []
  );

  // ─── SVG dimensions ──────────────────────────────────────────────────

  const svgWidth = LABEL_WIDTH + weeks * TOTAL_CELL_SIZE + 4;
  const svgHeight = MONTH_LABEL_HEIGHT + 7 * TOTAL_CELL_SIZE + 8;

  // ─── Domain selection ────────────────────────────────────────────────

  if (error) {
    return (
      <div className="rounded-lg border border-negative/30 bg-surface p-4">
        <p className="text-sm text-negative">Failed to load: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header: domain selector + consistency badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-white 
                       focus:outline-none focus:ring-2 focus:ring-positive/50"
          >
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.icon ?? ""} {d.label}
              </option>
            ))}
          </select>
          {consistency && (
            <ConsistencyBadge score={consistency.consistency} trend={consistency.trend} />
          )}
        </div>
        {loading && (
          <span className="text-xs text-neutral animate-pulse">loading...</span>
        )}
      </div>

      {/* SVG Heatmap */}
      <div className="overflow-x-auto">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="min-w-fit"
        >
          {/* Month labels */}
          {monthLabels.map(({ label, x }) => (
            <text
              key={`${x}-${label}`}
              x={x}
              y={MONTH_LABEL_HEIGHT - 4}
              fill="#8b949e"
              fontSize={10}
              fontFamily="var(--font-sans, system-ui)"
            >
              {label}
            </text>
          ))}

          {/* Day labels */}
          {DAY_LABELS.map((label, i) =>
            label ? (
              <text
                key={label}
                x={LABEL_WIDTH - 8}
                y={MONTH_LABEL_HEIGHT + i * TOTAL_CELL_SIZE + CELL_SIZE - 1}
                textAnchor="end"
                fill="#8b949e"
                fontSize={10}
                fontFamily="var(--font-sans, system-ui)"
              >
                {label}
              </text>
            ) : null
          )}

          {/* Cells */}
          {grid.map(({ date, value, weekIdx, dayIdx }) => (
            <HeatmapCell
              key={date}
              date={date}
              value={value}
              maxValue={domains.find((d) => d.id === selectedDomain)?.maxValue ?? 10}
              x={LABEL_WIDTH + weekIdx * TOTAL_CELL_SIZE}
              y={MONTH_LABEL_HEIGHT + dayIdx * TOTAL_CELL_SIZE}
              size={CELL_SIZE}
              onClick={onLogClick}
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-neutral">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <svg key={level} width={12} height={12} className="rounded-sm">
            <rect
              width={12}
              height={12}
              rx={2}
              fill={
                [
                  "var(--color-heat-0, #1a1a1a)",
                  "var(--color-heat-1, #0e4429)",
                  "var(--color-heat-2, #006d32)",
                  "var(--color-heat-3, #26a641)",
                  "var(--color-heat-4, #39d353)",
                ][level]
              }
            />
          </svg>
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
