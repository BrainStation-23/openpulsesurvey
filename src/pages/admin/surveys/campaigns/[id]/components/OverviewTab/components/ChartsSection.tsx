
import { ResponseOverTimeChart } from "./ResponseOverTimeChart";
import { StatusDistributionChart } from "./StatusDistributionChart";
import { SBUResponseRates } from "./SBUResponseRates";
import { TopPerformingSBUsChart } from "./TopPerformingSBUsChart";
import { TopPerformingManagersChart } from "./TopPerformingManagersChart";

interface ChartsSectionProps {
  responseData: any[] | undefined;
  statusData: any[] | undefined;
  campaignId: string;
  selectedInstanceId?: string;
}

export function ChartsSection({ 
  responseData,
  statusData,
  campaignId,
  selectedInstanceId
}: ChartsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-1">
          <StatusDistributionChart data={statusData} />
        </div>
        <div className="md:col-span-2">
          <ResponseOverTimeChart data={responseData} />
        </div>
      </div>
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <SBUResponseRates 
          campaignId={campaignId}
          instanceId={selectedInstanceId}
        />
        <div />
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <TopPerformingSBUsChart 
          campaignId={campaignId}
          instanceId={selectedInstanceId}
        />
        <TopPerformingManagersChart
          campaignId={campaignId}
          instanceId={selectedInstanceId}
        />
      </div>
    </div>
  );
}
