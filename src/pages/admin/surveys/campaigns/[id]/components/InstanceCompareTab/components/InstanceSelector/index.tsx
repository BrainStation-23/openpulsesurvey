
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InstanceSelectorProps {
  selectedInstanceId?: string;
  comparisonInstanceId?: string;
  onSelectInstance: (instanceId: string) => void;
  onSelectComparison: (instanceId: string) => void;
}

export function InstanceSelector({
  selectedInstanceId,
  comparisonInstanceId,
  onSelectInstance,
  onSelectComparison,
}: InstanceSelectorProps) {
  const { id: campaignId } = useParams<{ id: string }>();

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
  if (!instances?.length) return <div>No instances available</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="w-64">
          <p className="text-sm font-medium mb-2">Base Instance</p>
          <Select value={selectedInstanceId} onValueChange={onSelectInstance}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select base instance" />
            </SelectTrigger>
            <SelectContent>
              {instances.map((instance) => (
                <SelectItem key={instance.id} value={instance.id}>
                  Period {instance.period_number} ({new Date(instance.starts_at).toLocaleDateString()} - {new Date(instance.ends_at).toLocaleDateString()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-64">
          <p className="text-sm font-medium mb-2">Comparison Instance</p>
          <Select value={comparisonInstanceId} onValueChange={onSelectComparison}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select comparison instance" />
            </SelectTrigger>
            <SelectContent>
              {instances
                .filter((instance) => instance.id !== selectedInstanceId)
                .map((instance) => (
                  <SelectItem key={instance.id} value={instance.id}>
                    Period {instance.period_number} ({new Date(instance.starts_at).toLocaleDateString()} - {new Date(instance.ends_at).toLocaleDateString()})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
