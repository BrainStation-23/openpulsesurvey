
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { InstanceCard } from "./InstanceCard";

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
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Base Instance</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {instances.map((instance) => (
            <InstanceCard
              key={instance.id}
              periodNumber={instance.period_number}
              startsAt={instance.starts_at}
              endsAt={instance.ends_at}
              isSelected={instance.id === selectedInstanceId}
              onClick={() => onSelectInstance(instance.id)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Comparison Instance</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {instances
            .filter((instance) => instance.id !== selectedInstanceId)
            .map((instance) => (
              <InstanceCard
                key={instance.id}
                periodNumber={instance.period_number}
                startsAt={instance.starts_at}
                endsAt={instance.ends_at}
                isSelected={instance.id === comparisonInstanceId}
                onClick={() => onSelectComparison(instance.id)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
