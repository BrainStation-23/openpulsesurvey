
import { useState } from "react";
import { InstanceSelector } from "./components/InstanceSelector";
import { useInstanceComparison } from "./hooks/useInstanceComparison";
import { useQuestionComparison } from "./hooks/useQuestionComparison";
import { ComparisonCard } from "./components/shared/ComparisonCard";

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

  return (
    <div className="space-y-8">
      <InstanceSelector
        selectedInstanceId={selectedInstanceId}
        comparisonInstanceId={comparisonInstanceId}
        onSelectInstance={setSelectedInstanceId}
        onSelectComparison={setComparisonInstanceId}
      />

      {(isLoadingMetrics || isLoadingQuestions) && <div>Loading comparison data...</div>}

      {metricsComparison && (
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
      )}

      {/* We'll add more detailed comparison components here in subsequent implementations */}
    </div>
  );
}
