
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InstanceSelectorProps {
  campaignId: string | undefined;
  selectedInstanceId: string | undefined;
  onInstanceSelect: (instanceId: string) => void;
}

export function InstanceSelector({
  campaignId,
  selectedInstanceId,
  onInstanceSelect,
}: InstanceSelectorProps) {
  const { data: instances, isLoading } = useQuery({
    queryKey: ["completed-campaign-instances", campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      
      const { data, error } = await supabase
        .from("campaign_instances")
        .select("*")
        .eq("campaign_id", campaignId)
        .eq("status", "completed") // Only show completed instances for users
        .order("period_number", { ascending: false });

      if (error) {
        console.error("Error fetching completed instances:", error);
        throw error;
      }
      
      return data;
    },
    enabled: !!campaignId,
  });

  // Auto-select the most recent completed instance if none selected
  React.useEffect(() => {
    if (instances?.length && !selectedInstanceId) {
      const mostRecent = instances[0]; // Already sorted by period_number desc
      onInstanceSelect(mostRecent.id);
    }
  }, [instances, selectedInstanceId, onInstanceSelect]);

  if (!campaignId) {
    return <div className="text-sm text-muted-foreground">Select a campaign first to see available instances</div>;
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading instances...</div>;
  }

  if (!instances?.length) {
    return <div className="text-sm text-muted-foreground">No completed instances available for this campaign</div>;
  }

  return (
    <Select value={selectedInstanceId} onValueChange={onInstanceSelect}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select completed instance" />
      </SelectTrigger>
      <SelectContent>
        {instances.map((instance) => (
          <SelectItem key={instance.id} value={instance.id}>
            Period {instance.period_number} ({format(new Date(instance.starts_at), "MMM d")} - {format(new Date(instance.ends_at), "MMM d")})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
