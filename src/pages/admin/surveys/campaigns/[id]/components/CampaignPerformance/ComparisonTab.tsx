
import { useCampaignComparison } from "./hooks/useCampaignComparison";
import { PeriodComparisonChart } from "./components/PeriodComparisonChart";
import { CampaignInstance } from "./types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedDualInstanceSelector } from "../InstanceCompareTab/components/EnhancedDualInstanceSelector";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTopSBUComparison } from "../InstanceCompareTab/hooks/useTopSBUComparison";
import { useTopManagersComparison } from "../InstanceCompareTab/hooks/useTopManagersComparison";
import { SBUPerformanceChartView } from "../InstanceCompareTab/components/SBUPerformanceChartView";

interface ComparisonTabProps {
  campaignId: string;
  instances: CampaignInstance[];
}

export function ComparisonTab({ campaignId, instances }: ComparisonTabProps) {
  const [baseInstanceId, setBaseInstanceId] = useState<string>();
  const [comparisonInstanceId, setComparisonInstanceId] = useState<string>();
  
  const { periodAnalysis, isLoading: isPeriodLoading } = useCampaignComparison(campaignId, instances);
  const { data: sbuData, isLoading: isSBULoading } = useTopSBUComparison(campaignId, baseInstanceId, comparisonInstanceId);
  const { data: supervisorData, isLoading: isSupervisorLoading } = useTopManagersComparison(campaignId, baseInstanceId, comparisonInstanceId);

  const handleSwapInstances = () => {
    const temp = baseInstanceId;
    setBaseInstanceId(comparisonInstanceId);
    setComparisonInstanceId(temp);
  };

  const isLoading = isPeriodLoading || isSBULoading || isSupervisorLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!periodAnalysis?.length && !sbuData?.length) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No comparison data available for this campaign</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EnhancedDualInstanceSelector
        campaignId={campaignId}
        baseInstanceId={baseInstanceId}
        comparisonInstanceId={comparisonInstanceId}
        onBaseInstanceSelect={setBaseInstanceId}
        onComparisonInstanceSelect={setComparisonInstanceId}
        onSwapInstances={handleSwapInstances}
        disableSameSelection
        instancesData={instances}
      />

      {periodAnalysis?.length > 0 && (
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
      )}

      {sbuData?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">SBU Performance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <SBUPerformanceChartView data={sbuData} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
