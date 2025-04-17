
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { EnhancedInstanceSelector } from "../../EnhancedInstanceSelector";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";

interface EnhancedDualInstanceSelectorProps {
  campaignId: string;
  baseInstanceId?: string;
  comparisonInstanceId?: string;
  onBaseInstanceSelect: (instanceId: string) => void;
  onComparisonInstanceSelect: (instanceId: string) => void;
}

export function EnhancedDualInstanceSelector({
  campaignId,
  baseInstanceId,
  comparisonInstanceId,
  onBaseInstanceSelect,
  onComparisonInstanceSelect,
}: EnhancedDualInstanceSelectorProps) {
  // Function to swap base and comparison instances
  const handleSwapInstances = () => {
    if (baseInstanceId && comparisonInstanceId) {
      onBaseInstanceSelect(comparisonInstanceId);
      onComparisonInstanceSelect(baseInstanceId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="base-instance">Base Instance</Label>
          <EnhancedInstanceSelector
            campaignId={campaignId}
            selectedInstanceId={baseInstanceId}
            onInstanceSelect={onBaseInstanceSelect}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="comparison-instance">Comparison Instance</Label>
          <EnhancedInstanceSelector
            campaignId={campaignId}
            selectedInstanceId={comparisonInstanceId}
            onInstanceSelect={onComparisonInstanceSelect}
          />
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          onClick={handleSwapInstances}
          disabled={!baseInstanceId || !comparisonInstanceId}
          className="flex items-center gap-2"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Swap Instances
        </Button>
      </div>
    </div>
  );
}
