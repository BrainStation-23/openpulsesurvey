
import { useCampaignTrends } from "./hooks/useCampaignTrends";
import { TrendChart } from "./components/TrendChart";
import { CompletionRateChart } from "./components/CompletionRateChart";
import { ResponseVolumeChart } from "./components/ResponseVolumeChart";
import { TrendMetricCard } from "./components/TrendMetricCard";
import { CampaignInstance } from "./types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ResponseTrendsTabProps {
  campaignId: string;
  instances: CampaignInstance[];
}

export function ResponseTrendsTab({ campaignId, instances }: ResponseTrendsTabProps) {
  const { 
    trendData, 
    completionRates, 
    responseVolume, 
    metrics,
    isLoading 
  } = useCampaignTrends(campaignId, instances);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!trendData?.length) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No response data available for this campaign</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <TrendMetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <TrendChart 
            data={trendData} 
            title="Response Trends Over Time" 
          />
        </div>

        {completionRates?.length > 0 && (
          <div className="border rounded-lg p-4">
            <CompletionRateChart 
              data={completionRates} 
              title="Completion Rate Progress" 
            />
          </div>
        )}

        {responseVolume?.length > 0 && (
          <div className="border rounded-lg p-4">
            <ResponseVolumeChart 
              data={responseVolume} 
              title="Response Volume by Period" 
            />
          </div>
        )}
      </div>
    </div>
  );
}
