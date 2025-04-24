
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

interface ComparisonTabProps {
  campaignId: string;
  instances: CampaignInstance[];
}

export function ComparisonTab({ campaignId, instances }: ComparisonTabProps) {
  const [baseInstanceId, setBaseInstanceId] = useState<string>();
  const [comparisonInstanceId, setComparisonInstanceId] = useState<string>();
  
  const { periodAnalysis, isLoading } = useCampaignComparison(campaignId, instances);

  const handleSwapInstances = () => {
    const temp = baseInstanceId;
    setBaseInstanceId(comparisonInstanceId);
    setComparisonInstanceId(temp);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!periodAnalysis?.length) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No comparison data available for this campaign</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Instance Comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EnhancedDualInstanceSelector
            campaignId={campaignId}
            baseInstanceId={baseInstanceId}
            comparisonInstanceId={comparisonInstanceId}
            onBaseInstanceSelect={setBaseInstanceId}
            onComparisonInstanceSelect={setComparisonInstanceId}
            onSwapInstances={handleSwapInstances}
            disableSameSelection={true}
          />

          {baseInstanceId && comparisonInstanceId && (
            <div className="flex justify-center mt-4">
              <Button asChild>
                <Link 
                  to={`/admin/surveys/campaigns/${campaignId}?tab=compare&baseInstance=${baseInstanceId}&comparisonInstance=${comparisonInstanceId}`}
                  className="flex items-center gap-2"
                >
                  View Detailed Comparison
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
