
import { useId } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { Frown, Meh, Smile } from "lucide-react";

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcons?: boolean;
}

export function GaugeChart({
  value,
  min = -100,
  max = 100,
  label,
  size = "md",
  className,
  showIcons = true,
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

  const IconWrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("absolute text-muted-foreground", className)}>
      {children}
    </div>
  );

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      {showIcons && (
        <>
          <IconWrapper className="left-0 top-1/2">
            <Frown className="h-6 w-6 text-destructive" />
            <span className="mt-1 text-xs font-medium">0-6</span>
          </IconWrapper>
          <IconWrapper className="top-0 left-1/2 -translate-x-1/2">
            <Meh className="h-6 w-6 text-yellow-500" />
            <span className="mt-1 text-xs font-medium">7-8</span>
          </IconWrapper>
          <IconWrapper className="right-0 top-1/2">
            <Smile className="h-6 w-6 text-green-500" />
            <span className="mt-1 text-xs font-medium">9-10</span>
          </IconWrapper>
        </>
      )}
      
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
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className="text-4xl font-bold">{Math.round(value)}</span>
        {label && <span className="text-sm text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}
