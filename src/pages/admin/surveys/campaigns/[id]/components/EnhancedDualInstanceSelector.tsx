
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { EnhancedInstanceSelector } from "./EnhancedInstanceSelector";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";

interface EnhancedDualInstanceSelectorProps {
  campaignId: string;
  baseInstanceId?: string;
  comparisonInstanceId?: string;
  onBaseInstanceSelect: (instanceId: string) => void;
  onComparisonInstanceSelect: (instanceId: string) => void;
  onSwapInstances: () => void;
  disableSameSelection?: boolean;
  instancesData?: any[];
  isLoading?: boolean;
}

export function EnhancedDualInstanceSelector({
  campaignId,
  baseInstanceId,
  comparisonInstanceId,
  onBaseInstanceSelect,
  onComparisonInstanceSelect,
  onSwapInstances,
  disableSameSelection,
  instancesData,
  isLoading,
}: EnhancedDualInstanceSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="base-instance" className="flex items-center gap-2">
            Base Instance
          </Label>
          <EnhancedInstanceSelector
            campaignId={campaignId}
            selectedInstanceId={baseInstanceId}
            onInstanceSelect={onBaseInstanceSelect}
            disabledInstanceId={disableSameSelection ? comparisonInstanceId : undefined}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="comparison-instance" className="flex items-center gap-2">
            Comparison Instance
          </Label>
          <EnhancedInstanceSelector
            campaignId={campaignId}
            selectedInstanceId={comparisonInstanceId}
            onInstanceSelect={onComparisonInstanceSelect}
            disabledInstanceId={disableSameSelection ? baseInstanceId : undefined}
          />
        </div>
      </div>
      
      <div className="flex justify-center mt-4">
        <Button 
          variant="outline" 
          onClick={onSwapInstances}
          disabled={!baseInstanceId || !comparisonInstanceId || isLoading}
          className="flex items-center gap-2"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Swap Instances
        </Button>
      </div>
    </div>
  );
}
