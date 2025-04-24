
import { useCampaignComparison } from "./hooks/useCampaignComparison";
import { useSBUPerformance } from "./hooks/useSBUPerformance";
import { useSupervisorPerformance } from "./hooks/useSupervisorPerformance";
import { PeriodComparisonChart } from "./components/PeriodComparisonChart";
import { SBUPerformanceChart } from "./components/SBUPerformanceChart";
import { SupervisorPerformanceChart } from "./components/SupervisorPerformanceChart";
import { CampaignInstance } from "./types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstanceSelector } from "./components/InstanceSelector";
import { useState } from "react";

interface ComparisonTabProps {
  campaignId: string;
  instances: CampaignInstance[];
}

export function ComparisonTab({ campaignId, instances }: ComparisonTabProps) {
  const [selectedInstanceIds, setSelectedInstanceIds] = useState<string[]>([]);
  
  const { periodAnalysis, isLoading: isPeriodLoading } = useCampaignComparison(campaignId, instances);
  const { data: sbuData, isLoading: isSBULoading } = useSBUPerformance(campaignId, selectedInstanceIds);
  const { data: supervisorData, isLoading: isSupervisorLoading } = useSupervisorPerformance(campaignId, selectedInstanceIds);

  const isLoading = isPeriodLoading || isSBULoading || isSupervisorLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!periodAnalysis?.length && !sbuData?.length && !supervisorData?.length) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No comparison data available for this campaign</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InstanceSelector
        instances={instances}
        selectedInstanceIds={selectedInstanceIds}
        onInstanceSelect={setSelectedInstanceIds}
      />

      {selectedInstanceIds.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">SBU Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <SBUPerformanceChart data={sbuData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supervisor Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <SupervisorPerformanceChart data={supervisorData} />
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Period Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <PeriodComparisonChart 
            data={periodAnalysis} 
            title="Key Metrics Across Periods" 
          />
        </CardContent>
      </Card>
    </div>
  );
}
