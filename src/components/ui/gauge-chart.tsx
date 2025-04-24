
import { useId } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GaugeChart({
  value,
  min = -100,
  max = 100,
  label,
  size = "md",
  className,
}: GaugeChartProps) {
  const id = useId();
  const normalizedValue = Math.min(Math.max(value, min), max);
  const percentage = ((normalizedValue - min) / (max - min)) * 100;

  const data = [
    { name: "score", value: percentage },
    { name: "empty", value: 100 - percentage },
  ];

  const getColor = (score: number) => {
    if (score <= 0) return "#ef4444"; // Red for negative
    if (score <= 30) return "#eab308"; // Yellow for low positive
    return "#22c55e"; // Green for good
  };

  const sizes = {
    sm: 120,
    md: 200,
    lg: 300,
  };

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <ResponsiveContainer width={sizes[size]} height={sizes[size] / 2}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius="70%"
            outerRadius="100%"
            paddingAngle={0}
            dataKey="value"
          >
            <Cell key={`cell-score`} fill={getColor(value)} />
            <Cell key={`cell-empty`} fill="#e5e7eb" />
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className="text-4xl font-bold">{Math.round(value)}</span>
        {label && <span className="text-sm text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}
