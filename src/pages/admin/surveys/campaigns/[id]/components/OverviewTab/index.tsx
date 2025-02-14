
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { StatisticsSection } from "./components/StatisticsSection";
import { ChartsSection } from "./components/ChartsSection";
import { ResponseStatus } from "@/pages/admin/surveys/types/assignments";

interface OverviewTabProps {
  campaignId: string;
  selectedInstanceId?: string;
}

export function OverviewTab({ campaignId, selectedInstanceId }: OverviewTabProps) {
  const { data: instanceStats } = useQuery({
    queryKey: ["instance-stats", selectedInstanceId],
    queryFn: async () => {
      if (!selectedInstanceId) return null;

      const { data: assignments, error: assignmentsError } = await supabase
        .from("survey_assignments")
        .select("id")
        .eq("campaign_id", campaignId);

      if (assignmentsError) throw assignmentsError;

      const { data: responses, error: responsesError } = await supabase
        .from("survey_responses")
        .select("assignment_id")
        .eq("campaign_instance_id", selectedInstanceId)
        .eq("status", "submitted");

      if (responsesError) throw responsesError;

      const totalAssignments = assignments?.length || 0;
      const completedResponses = responses?.length || 0;
      const completionRate = totalAssignments > 0 
        ? (completedResponses / totalAssignments) * 100 
        : 0;

      return {
        completionRate,
        totalAssignments,
        completedResponses
      };
    },
    enabled: !!selectedInstanceId,
  });

  const { data: responseData } = useQuery({
    queryKey: ["instance-responses", selectedInstanceId],
    queryFn: async () => {
      const query = supabase
        .from("survey_responses")
        .select(`
          created_at,
          assignment:survey_assignments!inner(
            campaign_id
          )
        `)
        .eq("assignment.campaign_id", campaignId);

      if (selectedInstanceId) {
        query.eq("campaign_instance_id", selectedInstanceId);
      }

      const { data, error } = await query.order("created_at");
      if (error) throw error;

      return data.reduce((acc: any[], response) => {
        const date = format(new Date(response.created_at), "MMM d");
        const existingEntry = acc.find(entry => entry.date === date);
        
        if (existingEntry) {
          existingEntry.count += 1;
        } else {
          acc.push({ date, count: 1 });
        }
        
        return acc;
      }, []);
    },
  });

  const { data: statusData } = useQuery({
    queryKey: ["instance-status-distribution", selectedInstanceId],
    queryFn: async () => {
      if (!selectedInstanceId) return [];

      const { data, error } = await supabase
        .rpc('get_campaign_instance_status_distribution', {
          p_campaign_id: campaignId,
          p_instance_id: selectedInstanceId
        });

      if (error) throw error;

      // Ensure all status types have a value
      const defaultStatuses = ['submitted', 'in_progress', 'expired', 'assigned'];
      const statusMap = new Map(data.map(item => [item.status, item.count]));
      
      return defaultStatuses.map(status => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: statusMap.get(status) || 0
      }));
    },
    enabled: !!selectedInstanceId,
  });

  return (
    <div className="space-y-6">
      <StatisticsSection 
        instanceStats={instanceStats}
        campaignId={campaignId}
        selectedInstanceId={selectedInstanceId}
      />
      
      <ChartsSection 
        statusData={statusData}
        responseData={responseData}
        campaignId={campaignId}
        selectedInstanceId={selectedInstanceId}
      />
    </div>
  );
}
