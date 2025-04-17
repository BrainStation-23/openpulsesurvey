
import { useState } from "react";
import { InstanceSelector } from "./components/InstanceSelector";
import { useInstanceComparison } from "./hooks/useInstanceComparison";
import { useQuestionComparison } from "./hooks/useQuestionComparison";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComparisonCard } from "./components/shared/ComparisonCard";
import { DemographicComparison } from "./components/DemographicComparison";
import { QuestionComparison } from "./components/QuestionComparison";
import { ResponseTimingComparison } from "./components/ResponseTimingComparison";
import { DepartmentComparison } from "./components/DepartmentComparison";

export function InstanceCompareTab() {
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>();
  const [comparisonInstanceId, setComparisonInstanceId] = useState<string>();

  const { data: metricsComparison, isLoading: isLoadingMetrics } = useInstanceComparison(
    selectedInstanceId,
    comparisonInstanceId
  );

  const { data: questionComparison, isLoading: isLoadingQuestions } = useQuestionComparison(
    selectedInstanceId,
    comparisonInstanceId
  );

  const isLoading = isLoadingMetrics || isLoadingQuestions;

  if (isLoading) {
    return <div>Loading comparison data...</div>;
  }

  return (
    <div className="space-y-8">
      <InstanceSelector
        selectedInstanceId={selectedInstanceId}
        comparisonInstanceId={comparisonInstanceId}
        onSelectInstance={setSelectedInstanceId}
        onSelectComparison={setComparisonInstanceId}
      />

      {metricsComparison && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ComparisonCard
              title="Completion Rate"
              baseValue={metricsComparison.baseInstance.completion_rate ?? 0}
              comparisonValue={metricsComparison.comparisonInstance.completion_rate ?? 0}
              formatValue={(v) => `${v.toFixed(1)}%`}
            />
            <ComparisonCard
              title="Total Responses"
              baseValue={metricsComparison.baseInstance.total_responses ?? 0}
              comparisonValue={metricsComparison.comparisonInstance.total_responses ?? 0}
              formatValue={(v) => v.toString()}
            />
            <ComparisonCard
              title="Unique Respondents"
              baseValue={metricsComparison.baseInstance.unique_respondents ?? 0}
              comparisonValue={metricsComparison.comparisonInstance.unique_respondents ?? 0}
              formatValue={(v) => v.toString()}
            />
          </div>

          <Tabs defaultValue="demographics" className="space-y-4">
            <TabsList>
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="timing">Response Timing</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
            </TabsList>

            <TabsContent value="demographics" className="space-y-6">
              <DemographicComparison
                baseInstance={metricsComparison.baseInstance}
                comparisonInstance={metricsComparison.comparisonInstance}
              />
            </TabsContent>

            <TabsContent value="questions" className="space-y-6">
              <QuestionComparison
                baseInstance={questionComparison?.baseInstance ?? []}
                comparisonInstance={questionComparison?.comparisonInstance ?? []}
              />
            </TabsContent>

            <TabsContent value="timing" className="space-y-6">
              <ResponseTimingComparison
                baseInstance={metricsComparison.baseInstance}
                comparisonInstance={metricsComparison.comparisonInstance}
              />
            </TabsContent>

            <TabsContent value="departments" className="space-y-6">
              <DepartmentComparison
                baseInstance={metricsComparison.baseInstance}
                comparisonInstance={metricsComparison.comparisonInstance}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
