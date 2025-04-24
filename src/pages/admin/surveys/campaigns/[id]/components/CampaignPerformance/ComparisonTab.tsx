
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
    </div>
  );
}
