
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ComparisonMetrics } from "./ComparisonMetrics";
import { ComparisonChart } from "./ComparisonChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Instance {
  id: string;
  period_number: number;
  starts_at: string;
  ends_at: string;
}

interface InstanceComparisonProps {
  campaignId: string;
}

export function InstanceComparison({ campaignId }: InstanceComparisonProps) {
  const [baseInstanceId, setBaseInstanceId] = useState<string>("");
  const [comparisonInstanceId, setComparisonInstanceId] = useState<string>("");

  // Fetch available instances
  const { data: instances, isLoading: isLoadingInstances } = useQuery({
    queryKey: ["campaign-instances", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_instances")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("period_number", { ascending: false });

      if (error) throw error;
      return data as Instance[];
    },
  });

  // Fetch comparison metrics
  const { data: comparisonData, isLoading: isLoadingComparison } = useQuery({
    queryKey: ["instance-comparison", baseInstanceId, comparisonInstanceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instance_comparison_metrics")
        .select("*")
        .in("campaign_instance_id", [baseInstanceId, comparisonInstanceId]);

      if (error) throw error;
      return data;
    },
    enabled: !!(baseInstanceId && comparisonInstanceId),
  });

  // Fetch question comparison data
  const { data: questionComparisonData, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["question-comparison", baseInstanceId, comparisonInstanceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instance_question_comparison")
        .select("*")
        .in("campaign_instance_id", [baseInstanceId, comparisonInstanceId]);

      if (error) throw error;
      return data;
    },
    enabled: !!(baseInstanceId && comparisonInstanceId),
  });

  if (isLoadingInstances) {
    return <div>Loading instances...</div>;
  }

  const baseMetrics = comparisonData?.find(d => d.campaign_instance_id === baseInstanceId);
  const comparisonMetrics = comparisonData?.find(d => d.campaign_instance_id === comparisonInstanceId);

  const hasSelectedInstances = baseInstanceId && comparisonInstanceId;
  const isLoading = isLoadingComparison || isLoadingQuestions;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Instances to Compare</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={baseInstanceId} onValueChange={setBaseInstanceId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select base instance" />
            </SelectTrigger>
            <SelectContent>
              {instances?.map((instance) => (
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
              {instances?.map((instance) => (
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
        </CardContent>
      </Card>

      {hasSelectedInstances && isLoading && <div>Loading comparison data...</div>}

      {hasSelectedInstances && !isLoading && baseMetrics && comparisonMetrics && (
        <>
          <ComparisonMetrics
            baseMetrics={baseMetrics}
            comparisonMetrics={comparisonMetrics}
          />

          {questionComparisonData && (
            <ComparisonChart
              data={questionComparisonData.map(q => ({
                question: q.question_key,
                base: q.avg_numeric_value || q.yes_percentage,
                comparison: q.avg_numeric_value || q.yes_percentage,
              }))}
              title="Question Response Comparison"
              baseLabel={`Period ${baseMetrics.period_number}`}
              comparisonLabel={`Period ${comparisonMetrics.period_number}`}
            />
          )}
        </>
      )}
    </div>
  );
}
