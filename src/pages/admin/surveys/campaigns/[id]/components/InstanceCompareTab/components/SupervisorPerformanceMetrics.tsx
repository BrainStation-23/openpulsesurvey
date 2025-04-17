
import { Card, CardContent } from "@/components/ui/card";
import { MetricSummary } from "../types/instance-comparison";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface SupervisorPerformanceMetricsProps {
  metrics: MetricSummary[];
}

export function SupervisorPerformanceMetrics({ metrics }: SupervisorPerformanceMetricsProps) {
  const getChangeIndicator = (metric: MetricSummary) => {
    if (!metric.change) return null;
    
    if (metric.changeType === "positive") {
      return (
        <div className="flex items-center text-green-500">
          <ArrowUp className="h-4 w-4 mr-1" />
          <span>{typeof metric.change === 'number' ? metric.change.toFixed(1) + '%' : metric.change}</span>
        </div>
      );
    }
    
    if (metric.changeType === "negative") {
      return (
        <div className="flex items-center text-red-500">
          <ArrowDown className="h-4 w-4 mr-1" />
          <span>{typeof metric.change === 'number' ? Math.abs(metric.change).toFixed(1) + '%' : metric.change}</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center text-gray-500">
        <Minus className="h-4 w-4 mr-1" />
        <span>0%</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <div className="mt-1 flex items-center">
                  <h3 className="text-2xl font-bold mr-2">
                    {typeof metric.value === 'number' ? 
                      Number.isInteger(metric.value) ? 
                        metric.value : 
                        parseFloat(metric.value.toString()).toFixed(1) : 
                      metric.value}
                  </h3>
                  {getChangeIndicator(metric)}
                </div>
                {metric.description && (
                  <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                )}
              </div>
              <div className="mt-1">{metric.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
