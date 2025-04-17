
import { Card, CardContent } from "@/components/ui/card";
import { SBUPerformanceData } from "../types/instance-comparison";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface SBUPerformanceMetricsProps {
  data: SBUPerformanceData[];
}

export function SBUPerformanceMetrics({ data }: SBUPerformanceMetricsProps) {
  // Calculate summary metrics
  const improved = data.filter(d => d.category === "improved").length;
  const declined = data.filter(d => d.category === "declined").length;
  const unchanged = data.filter(d => d.category === "unchanged").length;
  
  // Find top improver and decliner
  const topImprover = [...data].sort((a, b) => b.change - a.change)[0];
  const topDecliner = [...data].sort((a, b) => a.change - b.change)[0];
  
  // Calculate average change
  const avgChange = data.length 
    ? data.reduce((sum, item) => sum + item.change, 0) / data.length
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div className="text-sm font-medium text-muted-foreground mb-2">Performance Trend</div>
          <div className="flex justify-between items-end">
            <div className="grid grid-cols-3 gap-2 w-full text-center">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-green-500">{improved}</span>
                <span className="text-xs text-muted-foreground">Improved</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold">{unchanged}</span>
                <span className="text-xs text-muted-foreground">Unchanged</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-red-500">{declined}</span>
                <span className="text-xs text-muted-foreground">Declined</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div className="text-sm font-medium text-muted-foreground mb-2">Top Improver</div>
          {topImprover ? (
            <div className="flex justify-between items-end">
              <div>
                <div className="text-lg font-bold truncate" title={topImprover.sbu}>
                  {topImprover.sbu}
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500 font-medium">
                    +{topImprover.change.toFixed(2)} points
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No data available</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div className="text-sm font-medium text-muted-foreground mb-2">Most Declined</div>
          {topDecliner && topDecliner.change < 0 ? (
            <div className="flex justify-between items-end">
              <div>
                <div className="text-lg font-bold truncate" title={topDecliner.sbu}>
                  {topDecliner.sbu}
                </div>
                <div className="flex items-center">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-500 font-medium">
                    {topDecliner.change.toFixed(2)} points
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No significant declines</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-col justify-between h-full">
          <div className="text-sm font-medium text-muted-foreground mb-2">Average Change</div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-2xl font-bold">
                {avgChange > 0 ? '+' : ''}{avgChange.toFixed(2)}
              </div>
              <div className="flex items-center">
                {avgChange > 0.05 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : avgChange < -0.05 ? (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                ) : (
                  <Minus className="h-4 w-4 text-muted-foreground mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  avgChange > 0.05 ? 'text-green-500' : 
                  avgChange < -0.05 ? 'text-red-500' : 
                  'text-muted-foreground'
                }`}>
                  {avgChange > 0.05 ? 'Improving' : 
                   avgChange < -0.05 ? 'Declining' : 
                   'Stable'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
