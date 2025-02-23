
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeltaIndicatorProps {
  value: number;
  className?: string;
  reverseColors?: boolean;
}

export function DeltaIndicator({ value, className, reverseColors = false }: DeltaIndicatorProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  const getColorClass = () => {
    if (isNeutral) return "text-muted-foreground";
    if (reverseColors) {
      return isPositive ? "text-destructive" : "text-green-500";
    }
    return isPositive ? "text-green-500" : "text-destructive";
  };

  return (
    <div className={cn("flex items-center gap-1", getColorClass(), className)}>
      {isPositive && <ArrowUpIcon className="h-4 w-4" />}
      {isNegative && <ArrowDownIcon className="h-4 w-4" />}
      {isNeutral && <MinusIcon className="h-4 w-4" />}
      <span className="font-medium">{Math.abs(value)}%</span>
    </div>
  );
}
