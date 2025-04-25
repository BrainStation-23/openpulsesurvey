
import { Card } from "@/components/ui/card";
import { HeatMapRow } from "./HeatMapRow";
import { Badge } from "@/components/ui/badge";

interface HeatMapData {
  dimension: string;
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
  avg_score?: number;
}

interface HeatMapChartProps {
  data: HeatMapData[];
  title?: string;
}

export function HeatMapChart({ data = [], title }: HeatMapChartProps) {
  // Return early if no data is provided
  if (!data || data.length === 0) {
    return (
      <div className="w-full p-4 text-center text-muted-foreground">
        No data available
      </div>
    );
  }

  const getColorIntensity = (percentage: number) => {
    // Minimum opacity of 0.1 (10%)
    const minOpacity = 0.1;
    // Scale the remaining 90% based on the percentage
    const opacity = minOpacity + ((1 - minOpacity) * (percentage / 100));
    // Convert to hex
    const hexOpacity = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return hexOpacity;
  };

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const needsAttention = (row: HeatMapData) => {
    const unsatisfiedPercentage = getPercentage(row.unsatisfied, row.total);
    return unsatisfiedPercentage > 50;
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] rounded-xl border shadow-sm bg-white">
          <thead>
            <tr>
              <th className="text-left p-3 bg-gray-50">Group</th>
              <th className="text-center p-3 bg-gray-50 border-l">Unsatisfied <span className="text-xs">(1-3)</span></th>
              <th className="text-center p-3 bg-gray-50 border-l">Neutral <span className="text-xs">(4)</span></th>
              <th className="text-center p-3 bg-gray-50 border-l">Satisfied <span className="text-xs">(5)</span></th>
              <th className="text-center p-3 bg-gray-50 border-l">Total</th>
              <th className="text-center p-3 bg-gray-50 border-l">Avg</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <HeatMapRow
                key={row.dimension}
                row={row}
                getPercentage={getPercentage}
                needsAttention={needsAttention}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-muted-foreground mt-4 flex gap-6 flex-wrap px-1">
        <span>
          <Badge className="scale-75 bg-[#ef4444]/80 mr-1"></Badge>
          Unsatisfied (1-3)
        </span>
        <span>
          <Badge className="scale-75 bg-[#eab308]/80 mr-1"></Badge>
          Neutral (4)
        </span>
        <span>
          <Badge className="scale-75 bg-[#22c55e]/80 mr-1"></Badge>
          Satisfied (5)
        </span>
        <span className="pl-2">
          <strong>Note:</strong> Bar length represents percentage in each group. Row highlight means &gt; 50% unsatisfied.
        </span>
      </div>
    </div>
  );
}
