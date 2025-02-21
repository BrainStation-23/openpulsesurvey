
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  baseValue: number;
  comparisonValue: number;
  format?: "number" | "percentage";
  inverted?: boolean;
}

function MetricCard({ title, baseValue, comparisonValue, format = "number", inverted = false }: MetricCardProps) {
  const difference = comparisonValue - baseValue;
  const percentageChange = baseValue ? (difference / baseValue) * 100 : 0;
  
  const isPositive = inverted ? difference < 0 : difference > 0;
  const isNeutral = difference === 0;

  const formattedValue = format === "percentage" 
    ? `${baseValue.toFixed(1)}%`
    : baseValue.toString();

  const formattedComparison = format === "percentage"
    ? `${comparisonValue.toFixed(1)}%`
    : comparisonValue.toString();

  return (
    <div className="flex flex-col space-y-2">
      <p className="text-sm font-medium">{title}</p>
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-bold">{formattedValue}</span>
        <div className={`flex items-center ${isPositive ? 'text-green-500' : isNeutral ? 'text-gray-500' : 'text-red-500'}`}>
          {isNeutral ? (
            <MinusIcon className="h-4 w-4" />
          ) : isPositive ? (
            <ArrowUpIcon className="h-4 w-4" />
          ) : (
            <ArrowDownIcon className="h-4 w-4" />
          )}
          <span className="text-sm ml-1">
            {Math.abs(percentageChange).toFixed(1)}%
          </span>
        </div>
        <span className="text-sm text-muted-foreground ml-2">
          → {formattedComparison}
        </span>
      </div>
    </div>
  );
}

interface ComparisonMetricsProps {
  baseMetrics: {
    period_number: number;
    starts_at: string;
    total_responses: number;
    completion_rate: number;
    avg_rating: number | null;
  };
  comparisonMetrics: {
    period_number: number;
    starts_at: string;
    total_responses: number;
    completion_rate: number;
    avg_rating: number | null;
  };
}

export function ComparisonMetrics({ baseMetrics, comparisonMetrics }: ComparisonMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Comparing Period {baseMetrics.period_number} ({formatDate(baseMetrics.starts_at)}) with Period {comparisonMetrics.period_number} ({formatDate(comparisonMetrics.starts_at)})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Completion Rate"
            baseValue={baseMetrics.completion_rate}
            comparisonValue={comparisonMetrics.completion_rate}
            format="percentage"
          />
          <MetricCard
            title="Total Responses"
            baseValue={baseMetrics.total_responses}
            comparisonValue={comparisonMetrics.total_responses}
          />
          {baseMetrics.avg_rating !== null && comparisonMetrics.avg_rating !== null && (
            <MetricCard
              title="Average Rating"
              baseValue={baseMetrics.avg_rating}
              comparisonValue={comparisonMetrics.avg_rating}
              format="number"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
