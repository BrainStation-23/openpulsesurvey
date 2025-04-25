
import { useState, useEffect } from "react";
import { useInstancesForComparison } from "./hooks/useInstancesForComparison";
import { useComparisonState } from "./hooks/useComparisonState";
import { ComparisonStateSelector } from "./components/ComparisonStateSelector";
import { ComparisonContent } from "./components/ComparisonContent";

interface InstanceCompareTabProps {
  campaignId?: string;
  instanceId?: string;
}

export function InstanceCompareTab({ campaignId, instanceId }: InstanceCompareTabProps) {
  const [activeTab, setActiveTab] = useState("sbu");
  
  const {
    comparison,
    handleBaseInstanceSelect,
    handleComparisonInstanceSelect,
    handleSwapInstances,
    handleConfirmComparison,
    handleChangeSelection
  } = useComparisonState();
  
  const { 
    suggestedBase, 
    suggestedComparison, 
    isLoading,
    instances 
  } = useInstancesForComparison(campaignId || '');
  
  useEffect(() => {
    if (!isLoading && suggestedBase && suggestedComparison && comparison.status === 'initial') {
      if (suggestedBase.id !== suggestedComparison.id) {
        handleBaseInstanceSelect(suggestedBase.id);
        handleComparisonInstanceSelect(suggestedComparison.id);
      }
    }
  }, [suggestedBase, suggestedComparison, isLoading, comparison.status]);

  return (
    <div className="space-y-6">
      <ComparisonStateSelector
        campaignId={campaignId || ''}
        comparison={comparison}
        onBaseInstanceSelect={handleBaseInstanceSelect}
        onComparisonInstanceSelect={handleComparisonInstanceSelect}
        onSwapInstances={handleSwapInstances}
        instances={instances}
        isLoading={isLoading}
      />

      <ComparisonContent
        comparison={comparison}
        campaignId={campaignId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onConfirmComparison={handleConfirmComparison}
        onChangeSelection={handleChangeSelection}
      />
    </div>
  );
}
