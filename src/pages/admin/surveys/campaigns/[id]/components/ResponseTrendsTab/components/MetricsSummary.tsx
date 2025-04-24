
import { Card, CardContent } from "@/components/ui/card";
import { ResponseMetrics } from "../types";

interface MetricsSummaryProps {
  metrics: ResponseMetrics;
  icon: React.ReactNode;
}

export function MetricsSummary({ metrics, icon }: MetricsSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
              <h3 className="text-2xl font-bold">{metrics.totalResponses}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Response Rate</p>
              <h3 className="text-2xl font-bold">{metrics.averageResponseRate.toFixed(1)}%</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Response Growth</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{metrics.responseGrowth.toFixed(1)}%</h3>
                {icon}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
