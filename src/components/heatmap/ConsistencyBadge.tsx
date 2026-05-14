"use client";

interface ConsistencyBadgeProps {
  score: number;
  trend: "improving" | "declining" | "stable" | "insufficient";
}

export function ConsistencyBadge({ score, trend }: ConsistencyBadgeProps) {
  const scorePct = (score * 100).toFixed(0);

  const trendConfig = {
    improving: { label: "▲ improving", color: "text-positive" },
    declining: { label: "▼ declining", color: "text-negative" },
    stable: { label: "◆ stable", color: "text-neutral" },
    insufficient: { label: "⋯ insufficient data", color: "text-neutral" },
  };

  const config = trendConfig[trend];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight text-white">
          {scorePct}
        </span>
        <span className="text-sm text-neutral">%</span>
      </div>
      <span className={`text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}
