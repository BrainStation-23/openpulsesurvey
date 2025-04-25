
import { useState } from "react";
import { ComparisonState } from "../types/comparison-state";

export function useComparisonState() {
  const [comparison, setComparison] = useState<ComparisonState>({
    baseInstanceId: undefined,
    comparisonInstanceId: undefined,
    status: 'initial'
  });

  const handleBaseInstanceSelect = (instanceId: string) => {
    if (instanceId === comparison.comparisonInstanceId) {
      setComparison({
        ...comparison,
        baseInstanceId: instanceId,
        status: 'invalid',
        errorMessage: 'Base and comparison instances cannot be the same'
      });
    } else {
      setComparison({
        ...comparison,
        baseInstanceId: instanceId,
        status: comparison.comparisonInstanceId ? 'selecting' : 'initial',
        errorMessage: undefined
      });
    }
  };

  const handleComparisonInstanceSelect = (instanceId: string) => {
    if (instanceId === comparison.baseInstanceId) {
      setComparison({
        ...comparison,
        comparisonInstanceId: instanceId,
        status: 'invalid',
        errorMessage: 'Base and comparison instances cannot be the same'
      });
    } else {
      setComparison({
        ...comparison,
        comparisonInstanceId: instanceId,
        status: comparison.baseInstanceId ? 'selecting' : 'initial',
        errorMessage: undefined
      });
    }
  };

  const handleSwapInstances = () => {
    if (comparison.baseInstanceId && comparison.comparisonInstanceId) {
      setComparison({
        baseInstanceId: comparison.comparisonInstanceId,
        comparisonInstanceId: comparison.baseInstanceId,
        status: comparison.status,
        errorMessage: undefined
      });
    }
  };

  const handleConfirmComparison = () => {
    if (comparison.baseInstanceId && comparison.comparisonInstanceId) {
      setComparison({
        ...comparison,
        status: 'ready'
      });
    }
  };

  const handleChangeSelection = () => {
    setComparison({
      ...comparison,
      status: 'selecting'
    });
  };

  return {
    comparison,
    handleBaseInstanceSelect,
    handleComparisonInstanceSelect,
    handleSwapInstances,
    handleConfirmComparison,
    handleChangeSelection
  };
}
