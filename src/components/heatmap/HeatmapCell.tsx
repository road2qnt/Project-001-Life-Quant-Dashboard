"use client";

import { memo, useState, useCallback } from "react";
import { getHeatmapLevel } from "@/src/lib/api";

interface HeatmapCellProps {
  date: string;
  value: number;
  maxValue: number;
  x: number;
  y: number;
  size: number;
  onClick?: (date: string) => void;
}

const colors = [
  "var(--color-heat-0, #1a1a1a)",
  "var(--color-heat-1, #0e4429)",
  "var(--color-heat-2, #006d32)",
  "var(--color-heat-3, #26a641)",
  "var(--color-heat-4, #39d353)",
];

function HeatmapCellComponent({
  date,
  value,
  maxValue,
  x,
  y,
  size,
  onClick,
}: HeatmapCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const level = getHeatmapLevel(value, maxValue);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleClick = useCallback(() => onClick?.(date), [onClick, date]);

  // Format tooltip date: "14 Nov 2024"
  const tooltipDate = new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Tooltip box: wider to fit full date
  const tooltipWidth = 120;
  const tooltipX = Math.max(0, x - tooltipWidth / 2 + size / 2);
  const tooltipY = y - 40;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        rx={3}
        ry={3}
        fill={colors[level]}
        className="cursor-pointer"
        style={{
          outline: isHovered ? "2px solid rgba(255,255,255,0.25)" : "none",
          outlineOffset: isHovered ? "1px" : "0",
          transition: "outline 0.1s ease",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
      {isHovered && (
        <g>
          <rect
            x={tooltipX}
            y={tooltipY}
            width={tooltipWidth}
            height={28}
            rx={4}
            fill="#0d1117"
            stroke="#30363d"
            strokeWidth={1}
          />
          <text
            x={tooltipX + tooltipWidth / 2}
            y={tooltipY + 18}
            textAnchor="middle"
            fill="#e6edf3"
            fontSize={11}
            fontFamily="var(--font-mono, monospace)"
          >
            <tspan fontWeight="bold">{value > 0 ? value.toFixed(1) : "—"}</tspan>
            <tspan fill="#8b949e" dx={4}>
              {tooltipDate}
            </tspan>
          </text>
        </g>
      )}
    </g>
  );
}

export const HeatmapCell = memo(HeatmapCellComponent);
