
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { EnhancedInstanceSelector } from "../../EnhancedInstanceSelector";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeftRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

interface CampaignInstance {
  id: string;
  period_number: number;
  starts_at: string;
  ends_at: string;
  status: 'active' | 'completed' | 'upcoming';
}

interface EnhancedDualInstanceSelectorProps {
  campaignId: string;
  baseInstanceId?: string;
  comparisonInstanceId?: string;
  onBaseInstanceSelect: (instanceId: string) => void;
  onComparisonInstanceSelect: (instanceId: string) => void;
  onSwapInstances: () => void;
  disableSameSelection?: boolean;
  instancesData?: CampaignInstance[];
  isLoading?: boolean;
}

export function EnhancedDualInstanceSelector({
  campaignId,
  baseInstanceId,
  comparisonInstanceId,
  onBaseInstanceSelect,
  onComparisonInstanceSelect,
  onSwapInstances,
  disableSameSelection = false,
  instancesData,
  isLoading: externalLoading,
}: EnhancedDualInstanceSelectorProps) {
  // Only fetch instances if not provided from the parent
  const { data: fetchedInstances, isLoading: fetchLoading } = useQuery({
    queryKey: ["campaign-instances", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_instances")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("period_number", { ascending: false });

      if (error) {
        throw error;
      }
      return data as CampaignInstance[];
    },
    enabled: !!campaignId && !instancesData,
  });

  const instances = instancesData || fetchedInstances;
  const isLoading = externalLoading || fetchLoading;

  // Validation warning state
  const [warning, setWarning] = useState<string | null>(null);

  // Update warning if both are the same
  useEffect(() => {
    if (baseInstanceId && comparisonInstanceId && baseInstanceId === comparisonInstanceId) {
      setWarning("Base and comparison instances should be different for meaningful comparison");
    } else {
      setWarning(null);
    }
  }, [baseInstanceId, comparisonInstanceId]);

  // Function to format instance name
  const formatInstanceName = (instance?: CampaignInstance) => {
    if (!instance) return "Not selected";
    
    return `Period ${instance.period_number} (${format(new Date(instance.starts_at), "MMM d")} - ${format(new Date(instance.ends_at), "MMM d")})${instance.status === "active" ? " (Active)" : ""}`;
  };

  // Get instance objects
  const baseInstance = instances?.find(i => i.id === baseInstanceId);
  const comparisonInstance = instances?.find(i => i.id === comparisonInstanceId);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="base-instance" className="flex items-center gap-2">
            Base Instance 
            {baseInstance && <span className="text-xs text-muted-foreground">({formatInstanceName(baseInstance)})</span>}
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
            {comparisonInstance && <span className="text-xs text-muted-foreground">({formatInstanceName(comparisonInstance)})</span>}
          </Label>
          <EnhancedInstanceSelector
            campaignId={campaignId}
            selectedInstanceId={comparisonInstanceId}
            onInstanceSelect={onComparisonInstanceSelect}
            disabledInstanceId={disableSameSelection ? baseInstanceId : undefined}
          />
        </div>
      </div>
      
      {warning && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-center">
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
