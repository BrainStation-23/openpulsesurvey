
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
import { Label } from "@/components/ui/label";

interface DualInstanceSelectorProps {
  campaignId: string;
  baseInstanceId?: string;
  comparisonInstanceId?: string;
  onBaseInstanceSelect: (instanceId: string) => void;
  onComparisonInstanceSelect: (instanceId: string) => void;
}

export function DualInstanceSelector({
  campaignId,
  baseInstanceId,
  comparisonInstanceId,
  onBaseInstanceSelect,
  onComparisonInstanceSelect,
}: DualInstanceSelectorProps) {
  const { data: instances, isLoading } = useQuery({
    queryKey: ["campaign-instances", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_instances")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("period_number", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!campaignId,
  });

  if (isLoading) return <div>Loading instances...</div>;

  if (!instances?.length) {
    return <div className="text-sm text-muted-foreground">No instances available for comparison</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <Label htmlFor="base-instance">Base Instance</Label>
        <Select value={baseInstanceId} onValueChange={onBaseInstanceSelect}>
          <SelectTrigger id="base-instance" className="w-full">
            <SelectValue placeholder="Select base instance" />
          </SelectTrigger>
          <SelectContent>
            {instances.map((instance) => (
              <SelectItem 
                key={instance.id} 
                value={instance.id}
                disabled={instance.id === comparisonInstanceId}
              >
                Period {instance.period_number} ({format(new Date(instance.starts_at), "MMM d")} - {format(new Date(instance.ends_at), "MMM d")})
                {instance.status === "active" && " (Active)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Label htmlFor="comparison-instance">Comparison Instance</Label>
        <Select value={comparisonInstanceId} onValueChange={onComparisonInstanceSelect}>
          <SelectTrigger id="comparison-instance" className="w-full">
            <SelectValue placeholder="Select comparison instance" />
          </SelectTrigger>
          <SelectContent>
            {instances.map((instance) => (
              <SelectItem 
                key={instance.id} 
                value={instance.id}
                disabled={instance.id === baseInstanceId}
              >
                Period {instance.period_number} ({format(new Date(instance.starts_at), "MMM d")} - {format(new Date(instance.ends_at), "MMM d")})
                {instance.status === "active" && " (Active)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
