
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface ComparisonSummaryCardProps {
  title: string;
  baseValue: number;
  comparisonValue: number;
  format?: "percent" | "number";
  icon?: React.ReactNode;
  loading?: boolean;
}

export function ComparisonSummaryCard({
  title,
  baseValue,
  comparisonValue,
  format = "percent",
  icon,
  loading = false,
}: ComparisonSummaryCardProps) {
  const difference = baseValue - comparisonValue;
  const percentChange = comparisonValue ? (difference / comparisonValue) * 100 : 0;
  
  const renderValue = (value: number) => {
    if (format === "percent") {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };

  const getDifferenceColor = () => {
    if (difference > 0) return "text-green-500";
    if (difference < 0) return "text-red-500";
    return "text-gray-500";
  };

  const renderDifferenceIcon = () => {
    if (difference > 0) return <ArrowUp className="h-4 w-4" />;
    if (difference < 0) return <ArrowDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-10 animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{renderValue(baseValue)}</div>
        <div className={`flex items-center gap-1 mt-1 ${getDifferenceColor()}`}>
          {renderDifferenceIcon()}
          <span className="text-sm font-medium">
            {Math.abs(percentChange).toFixed(1)}% {difference > 0 ? "increase" : difference < 0 ? "decrease" : "no change"}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Compared to {renderValue(comparisonValue)}
        </div>
      </CardContent>
    </Card>
  );
}
