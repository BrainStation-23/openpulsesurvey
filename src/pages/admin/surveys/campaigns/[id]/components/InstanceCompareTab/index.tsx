
import { useState } from "react";
import { useInstancesForComparison } from "./hooks/useInstancesForComparison";
import { useTopManagersComparison } from "./hooks/useTopManagersComparison";
import { useTopSBUComparison } from "./hooks/useTopSBUComparison";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SupervisorPerformanceMetrics } from "./components/SupervisorPerformanceMetrics";
import { SBUPerformanceMetrics } from "./components/SBUPerformanceMetrics";
import { SBUPerformanceChartView } from "./components/SBUPerformanceChartView";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Users2, Building2 } from "lucide-react";

interface InstanceCompareTabProps {
  campaignId: string;
}

export function InstanceCompareTab({ campaignId }: InstanceCompareTabProps) {
  const [baseInstanceId, setBaseInstanceId] = useState<string>();
  const [comparisonInstanceId, setComparisonInstanceId] = useState<string>();

  const { instances, isLoading: isLoadingInstances } = useInstancesForComparison(campaignId);
  
  const { data: managerData, isLoading: isLoadingManagers } = useTopManagersComparison(
    campaignId,
    baseInstanceId,
    comparisonInstanceId
  );

  const { data: sbuData, isLoading: isLoadingSBUs } = useTopSBUComparison(
    campaignId,
    baseInstanceId,
    comparisonInstanceId
  );

  const isLoading = isLoadingInstances || isLoadingManagers || isLoadingSBUs;

  if (isLoadingInstances) {
    return <LoadingSpinner />;
  }

  if (!instances || instances.length < 2) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        At least two instances are needed for comparison.
      </div>
    );
  }

  // Transform SBU data for the performance metrics component
  const sbuPerformanceData = sbuData?.map(sbu => ({
    sbu: sbu.sbu,
    baseScore: sbu.baseScore,
    comparisonScore: sbu.comparisonScore,
    change: sbu.change,
    baseRank: sbu.baseRank,
    comparisonRank: sbu.comparisonRank,
    rankChange: sbu.rankChange,
    category: sbu.change > 0 ? 'improved' : sbu.change < 0 ? 'declined' : 'unchanged'
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Select value={baseInstanceId} onValueChange={setBaseInstanceId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select base instance" />
          </SelectTrigger>
          <SelectContent>
            {instances.map((instance) => (
              <SelectItem key={instance.id} value={instance.id}>
                Period {instance.period_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={comparisonInstanceId} onValueChange={setComparisonInstanceId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select comparison instance" />
          </SelectTrigger>
          <SelectContent>
            {instances.map((instance) => (
              <SelectItem 
                key={instance.id} 
                value={instance.id}
                disabled={instance.id === baseInstanceId}
              >
                Period {instance.period_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!baseInstanceId || !comparisonInstanceId ? (
        <div className="text-center py-8 text-muted-foreground">
          Please select two instances to compare.
        </div>
      ) : isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                SBU Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SBUPerformanceMetrics data={sbuPerformanceData} />
              <SBUPerformanceChartView data={sbuPerformanceData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users2 className="h-5 w-5" />
                Manager Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              {managerData && (
                <SupervisorPerformanceMetrics
                  metrics={[
                    {
                      title: "Top Performing Managers",
                      value: managerData.filter(m => m.comparison_score > m.base_score).length,
                      change: "+",
                      changeType: "positive"
                    },
                    {
                      title: "Average Score Change",
                      value: managerData.reduce((acc, curr) => acc + curr.change, 0) / managerData.length,
                      changeType: "neutral"
                    },
                    {
                      title: "Most Improved",
                      value: Math.max(...managerData.map(m => m.change)),
                      changeType: "positive"
                    }
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
