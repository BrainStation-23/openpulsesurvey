
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { TrendMetric } from "../types";

interface TrendMetricCardProps {
  metric: TrendMetric;
}

export function TrendMetricCard({ metric }: TrendMetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-2">
          <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
          
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold">{metric.value}</span>
            
            {metric.change !== undefined && (
              <div className="flex items-center">
                {metric.changeDirection === "positive" ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : metric.changeDirection === "negative" ? (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                ) : null}
                
                <span className={`text-sm font-medium ${
                  metric.changeDirection === "positive" ? "text-green-500" :
                  metric.changeDirection === "negative" ? "text-red-500" :
                  "text-muted-foreground"
                }`}>
                  {metric.change > 0 ? "+" : ""}{metric.change.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          
          {metric.description && (
            <span className="text-xs text-muted-foreground mt-1">
              {metric.description}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
