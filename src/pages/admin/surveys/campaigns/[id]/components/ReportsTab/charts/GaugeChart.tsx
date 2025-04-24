
import { useCallback } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";

interface GaugeChartProps {
  score: number;
  size?: number;
}

export function GaugeChart({ score, size = 200 }: GaugeChartProps) {
  const normalizedScore = ((score + 100) / 200) * 100; // Convert from -100 to 100 range to 0 to 100

  const data = [
    { value: normalizedScore },
    { value: 100 - normalizedScore }
  ];

  const getColor = useCallback((score: number) => {
    if (score <= -50) return "#ef4444";
    if (score <= 0) return "#f97316";
    if (score <= 30) return "#eab308";
    return "#22c55e";
  }, []);

  return (
    <div className="relative group">
      <PieChart width={size} height={size/2}>
        <Pie
          data={data}
          cx={size/2}
          cy={size/2}
          startAngle={180}
          endAngle={0}
          innerRadius={(size/2) - 20}
          outerRadius={size/2}
          paddingAngle={0}
          dataKey="value"
        >
          <Cell fill={getColor(score)} />
          <Cell fill="#e5e7eb" />
        </Pie>
      </PieChart>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div 
          className={cn(
            "text-2xl font-bold transition-all group-hover:scale-110",
            score >= 30 ? "text-green-500" : 
            score >= 0 ? "text-yellow-500" : 
            score >= -50 ? "text-orange-500" : 
            "text-red-500"
          )}
        >
          {Math.round(score)}
        </div>
      </div>
    </div>
  );
}
