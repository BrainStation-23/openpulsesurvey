
import React from "react";
import { Badge } from "@/components/ui/badge";

interface HeatMapData {
  dimension: string;
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
}

interface HeatMapRowProps {
  row: HeatMapData;
  getPercentage: (value: number, total: number) => number;
  getAverage: (row: HeatMapData) => number;
  needsAttention: (row: HeatMapData) => boolean;
}

export function HeatMapRow({ row, getPercentage, getAverage, needsAttention }: HeatMapRowProps) {
  const unsatisfiedPct = getPercentage(row.unsatisfied, row.total);
  const neutralPct = getPercentage(row.neutral, row.total);
  const satisfiedPct = getPercentage(row.satisfied, row.total);

  // For better visualization, we use colored bars beside the values
  const Bar = ({
    percent,
    color,
    "data-tooltip": tooltip,
  }: {
    percent: number;
    color: string;
    "data-tooltip"?: string;
  }) => (
    <div className="flex items-center gap-2">
      <div
        className="h-3 rounded"
        style={{
          width: `${Math.max(percent, 8)}%`,
          backgroundColor: color,
          minWidth: 28,
          opacity: percent === 0 ? 0.2 : 1,
          transition: "width 0.2s",
        }}
        data-tooltip={tooltip}
        title={tooltip}
      />
      <span className="text-xs text-gray-900">{percent}%</span>
    </div>
  );

  // Color definitions
  const UNSAT_COLOR = "#ef4444";
  const NEUTRAL_COLOR = "#eab308";
  const SAT_COLOR = "#22c55e";

  const avg = getAverage(row);

  return (
    <tr
      className={
        "transition bg-white even:bg-gray-50 border-b " +
        (needsAttention(row) ? "ring-2 ring-red-200 bg-red-50" : "")
      }
    >
      <td className={`p-3 whitespace-nowrap font-medium text-left ${needsAttention(row) ? "text-red-600" : "text-gray-700"}`}>
        {row.dimension}
        {needsAttention(row) && (
          <span className="ml-1 text-xs font-normal text-red-500">Needs Attention</span>
        )}
      </td>
      <td className="p-3 text-center">
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs text-muted-foreground block">
            {row.unsatisfied} <span className="text-[11px]">resp.</span>
          </span>
          <Bar percent={unsatisfiedPct} color={UNSAT_COLOR} data-tooltip="Unsatisfied %" />
        </div>
      </td>
      <td className="p-3 text-center">
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs text-muted-foreground block">
            {row.neutral} <span className="text-[11px]">resp.</span>
          </span>
          <Bar percent={neutralPct} color={NEUTRAL_COLOR} data-tooltip="Neutral %" />
        </div>
      </td>
      <td className="p-3 text-center">
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs text-muted-foreground block">
            {row.satisfied} <span className="text-[11px]">resp.</span>
          </span>
          <Bar percent={satisfiedPct} color={SAT_COLOR} data-tooltip="Satisfied %" />
        </div>
      </td>
      <td className="p-3 text-center align-middle">
        <Badge variant="outline" className="text-xs">
          {row.total} total
        </Badge>
      </td>
      <td className="p-3 text-center align-middle">
        <span
          className={
            "text-sm font-semibold " +
            (avg < 3
              ? "text-red-500"
              : avg < 4
              ? "text-yellow-600"
              : "text-green-600")
          }
          title={`Avg: ${avg.toFixed(2)}`}
        >
          {avg.toFixed(2)}
        </span>
      </td>
    </tr>
  );
}
