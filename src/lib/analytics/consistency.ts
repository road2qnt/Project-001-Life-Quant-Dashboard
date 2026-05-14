export interface EventData {
  value: number;
  timestamp: string;
}

export interface ConsistencyResult {
  consistency: number;
  activeDays: number;
  totalDays: number;
  avgValue: number;
}

/**
 * Compute consistency score over a date range.
 *
 * Formula: (active_days / total_days) * (avg_value / max_value)
 * Range: [0, 1]
 *
 * Penalizes both absence AND low effort.
 */
export function consistencyScore(
  events: EventData[],
  totalDays: number,
  maxValue: number
): ConsistencyResult {
  if (totalDays <= 0 || maxValue <= 0 || events.length === 0) {
    return { consistency: 0, activeDays: 0, totalDays, avgValue: 0 };
  }

  // Count unique active days
  const activeDates = new Set(
    events.map((e) => e.timestamp.slice(0, 10))
  );
  const activeDays = activeDates.size;

  // Average value on active days
  const avgValue =
    events.reduce((sum, e) => sum + e.value, 0) / events.length;

  const frequency = activeDays / totalDays;
  const intensity = avgValue / maxValue;

  const consistency = frequency * intensity;

  return {
    consistency: Math.min(consistency, 1),
    activeDays,
    totalDays,
    avgValue,
  };
}

/**
 * Compute weekly consistency scores for trend analysis.
 */
export function weeklyConsistencyScores(
  events: EventData[],
  maxValue: number,
  weeks: number = 8
): { weekStart: string; consistency: number }[] {
  const now = new Date();
  const scores: { weekStart: string; consistency: number }[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() - 6 + i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const weekEndStr = weekEnd.toISOString().slice(0, 10);

    const weekEvents = events.filter((e) => {
      const date = e.timestamp.slice(0, 10);
      return date >= weekStartStr && date < weekEndStr;
    });

    const result = consistencyScore(weekEvents, 7, maxValue);
    scores.push({ weekStart: weekStartStr, consistency: result.consistency });
  }

  return scores;
}

/**
 * Compute trend direction from weekly consistency scores.
 */
export function trendDirection(
  weeklyScores: number[]
): "improving" | "declining" | "stable" | "insufficient" {
  if (weeklyScores.length < 4) return "insufficient";

  const n = weeklyScores.length;
  const indices = weeklyScores.map((_, i) => i);

  // Linear regression slope
  const meanX = indices.reduce((a, b) => a + b, 0) / n;
  const meanY = weeklyScores.reduce((a, b) => a + b, 0) / n;

  const numerator = indices.reduce(
    (sum, x, i) => sum + (x - meanX) * (weeklyScores[i] - meanY),
    0
  );
  const denominator = indices.reduce(
    (sum, x) => sum + (x - meanX) * (x - meanX),
    0
  );

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const threshold = 0.1 * (weeklyScores.reduce((a, b) => a + b, 0) / n);

  if (slope > threshold) return "improving";
  if (slope < -threshold) return "declining";
  return "stable";
}

/**
 * Compute cognitive drift indicator.
 * Compares 4-week rolling average against 12-week rolling average.
 */
export function cognitiveDrift(
  weeklyScores: number[]
): {
  detected: boolean;
  driftMagnitude: number;
  weeksSinceDrift: number;
} {
  if (weeklyScores.length < 12) {
    return { detected: false, driftMagnitude: 0, weeksSinceDrift: 0 };
  }

  const recent4 = weeklyScores.slice(-4);
  const baseline12 = weeklyScores.slice(-12, -4);

  const recentAvg = recent4.reduce((a, b) => a + b, 0) / 4;
  const baselineAvg = baseline12.reduce((a, b) => a + b, 0) / 8;

  const driftMagnitude = baselineAvg - recentAvg;

  return {
    detected: driftMagnitude > 0.15,
    driftMagnitude,
    weeksSinceDrift: driftMagnitude > 0.15 ? 4 : 0,
  };
}
