
import { ResponseStatusChartData } from "@/pages/admin/surveys/types/assignments";
import { StatusDistributionChart } from "../StatusDistributionChart";
import { ResponseRateChart } from "../ResponseRateChart";
import { ResponseByLocationChart } from "../ResponseByLocationChart";
import { ResponseByGenderChart } from "../ResponseByGenderChart";
import { ResponseByEmploymentTypeChart } from "../ResponseByEmploymentTypeChart";
import { TopPerformingSBUsChart } from "./TopPerformingSBUsChart";
import { TopPerformingManagersChart } from "./TopPerformingManagersChart";

type ChartsSectionProps = {
  statusData?: ResponseStatusChartData[];
  responseData?: { date: string; count: number }[];
  campaignId: string;
  selectedInstanceId?: string;
};

export function ChartsSection({ 
  statusData, 
  responseData,
  campaignId,
  selectedInstanceId
}: ChartsSectionProps) {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <StatusDistributionChart data={statusData} />
        <ResponseRateChart data={responseData} />
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <ResponseByLocationChart 
          campaignId={campaignId} 
          instanceId={selectedInstanceId} 
        />
        <ResponseByGenderChart 
          campaignId={campaignId} 
          instanceId={selectedInstanceId} 
        />
        <ResponseByEmploymentTypeChart 
          campaignId={campaignId} 
          instanceId={selectedInstanceId} 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TopPerformingSBUsChart 
          campaignId={campaignId} 
          instanceId={selectedInstanceId} 
        />
        <TopPerformingManagersChart 
          campaignId={campaignId} 
          instanceId={selectedInstanceId} 
        />
      </div>
    </>
  );
}
