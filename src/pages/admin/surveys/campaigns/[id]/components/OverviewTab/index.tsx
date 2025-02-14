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
        .eq("campaign_instance_id", selectedInstanceId);

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

      // Get assignments
      const { data: assignmentsData } = await supabase
        .from("survey_assignments")
        .select("id")
        .eq("campaign_id", campaignId);

      if (!assignmentsData) return [];

      // Get status for each assignment using get_instance_assignment_status
      const statusCounts: Record<string, number> = {};

      await Promise.all(
        assignmentsData.map(async (assignment) => {
          const { data: status } = await supabase
            .rpc('get_instance_assignment_status', {
              p_assignment_id: assignment.id,
              p_instance_id: selectedInstanceId
            });
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        })
      );

      return Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
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
