
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResponseTrends } from "./hooks/useResponseTrends";
import { TrendChart } from "./components/TrendChart";
import { MetricsSummary } from "./components/MetricsSummary";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface ResponseTrendsTabProps {
  campaignId: string;
}

export function ResponseTrendsTab({ campaignId }: ResponseTrendsTabProps) {
  const { data, isLoading } = useResponseTrends(campaignId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || !data.trends.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No completed instances available for trend analysis
      </div>
    );
  }

  const trendIcon = {
    up: <TrendingUp className="h-4 w-4 text-green-500" />,
    down: <TrendingDown className="h-4 w-4 text-red-500" />,
    stable: <Minus className="h-4 w-4 text-yellow-500" />
  }[data.metrics.trendDirection];

  return (
    <div className="space-y-6">
      <MetricsSummary metrics={data.metrics} icon={trendIcon} />
      
      <Card>
        <CardHeader>
          <CardTitle>Response Rate Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart trends={data.trends} />
        </CardContent>
      </Card>
    </div>
  );
}
