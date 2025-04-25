
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedDualInstanceSelector } from "./EnhancedDualInstanceSelector";
import { ComparisonState } from "../types/comparison-state";

interface ComparisonStateSelectorProps {
  campaignId: string;
  comparison: ComparisonState;
  onBaseInstanceSelect: (instanceId: string) => void;
  onComparisonInstanceSelect: (instanceId: string) => void;
  onSwapInstances: () => void;
  instances: any[];
  isLoading: boolean;
}

export function ComparisonStateSelector({
  campaignId,
  comparison,
  onBaseInstanceSelect,
  onComparisonInstanceSelect,
  onSwapInstances,
  instances,
  isLoading
}: ComparisonStateSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compare Instances</CardTitle>
      </CardHeader>
      <CardContent>
        <EnhancedDualInstanceSelector
          campaignId={campaignId}
          baseInstanceId={comparison.baseInstanceId}
          comparisonInstanceId={comparison.comparisonInstanceId}
          onBaseInstanceSelect={onBaseInstanceSelect}
          onComparisonInstanceSelect={onComparisonInstanceSelect}
          onSwapInstances={onSwapInstances}
          disableSameSelection={true}
          instancesData={instances}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
