
import { SBUResponseRates } from "../SBUResponseRates";
import { StatusDistributionCard } from "../StatusDistributionCard";

type StatisticsSectionProps = {
  instanceStats?: {
    totalAssignments: number;
    completedResponses: number;
  } | null;
  campaignId: string;
  selectedInstanceId?: string;
};

export function StatisticsSection({ 
  instanceStats, 
  campaignId, 
  selectedInstanceId 
}: StatisticsSectionProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-1">
        <StatusDistributionCard 
          campaignId={campaignId}
          selectedInstanceId={selectedInstanceId}
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-1">
        <SBUResponseRates 
          campaignId={campaignId} 
          instanceId={selectedInstanceId} 
        />
      </div>
    </>
  );
}
