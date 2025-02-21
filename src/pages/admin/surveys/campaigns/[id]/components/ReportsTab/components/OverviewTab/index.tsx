
import { CompletionRateCard } from "./CompletionRateCard";
import { ResponseRateChart } from "./ResponseRateChart";
import { StatusDistributionChart } from "./StatusDistributionChart";
import { ResponseByGenderChart } from "./ResponseByGenderChart";
import { ResponseByLocationChart } from "./ResponseByLocationChart";
import { ResponseByEmploymentTypeChart } from "./ResponseByEmploymentTypeChart";
import { CompletionTrends } from "./CompletionTrends";
import type { ComparisonDimension } from "../../types/comparison";

interface OverviewTabProps {
  campaignId: string;
  instanceId?: string;
  comparisonDimension: ComparisonDimension;
}

export function OverviewTab({ campaignId, instanceId, comparisonDimension }: OverviewTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <CompletionRateCard completionRate={75} />
      <ResponseRateChart data={[]} />
      <StatusDistributionChart data={[]} />
      
      {comparisonDimension === "gender" && (
        <ResponseByGenderChart campaignId={campaignId} instanceId={instanceId} />
      )}
      
      {comparisonDimension === "location" && (
        <ResponseByLocationChart campaignId={campaignId} instanceId={instanceId} />
      )}
      
      {comparisonDimension === "employment_type" && (
        <ResponseByEmploymentTypeChart campaignId={campaignId} instanceId={instanceId} />
      )}
      
      <CompletionTrends campaignId={campaignId} instanceId={instanceId} />
    </div>
  );
}
