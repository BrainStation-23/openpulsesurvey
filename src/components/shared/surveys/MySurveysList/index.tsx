import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import SurveyCard from "./SurveyCard";
import SurveyFilters from "./components/SurveyFilters";
import { Database } from "@/integrations/supabase/types";
import { ResponseStatus } from "@/pages/admin/surveys/types/assignments";

type SurveyAssignment = {
  id: string;
  survey_id: string;
  user_id: string;
  due_date: string | null;
  created_by: string;
  created_at: string | null;
  updated_at: string | null;
  is_organization_wide: boolean | null;
  campaign_id: string | null;
  survey: {
    id: string;
    name: string;
    description: string | null;
    status: Database["public"]["Enums"]["survey_status"] | null;
    created_at: string;
    created_by: string;
    json_data: Database["public"]["Tables"]["surveys"]["Row"]["json_data"];
    tags: string[] | null;
    updated_at: string;
  };
  campaign?: {
    id: string;
    name: string;
    description: string | null;
    completion_rate: number | null;
    status: string;
    campaign_type: string;
    created_at: string;
    created_by: string;
    ends_at: string | null;
    is_recurring: boolean | null;
    recurring_days: number[] | null;
    recurring_ends_at: string | null;
    recurring_frequency: string | null;
    starts_at: string;
    instance_duration_days: number | null;
    instance_end_time: string | null;
    updated_at: string;
  };
  active_instance?: {
    id: string;
    starts_at: string;
    ends_at: string;
    status: string;
  } | null;
};

export default function MySurveysList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: assignments, isLoading } = useQuery({
    queryKey: ["my-survey-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_assignments")
        .select(`
          id,
          public_access_token,
          last_reminder_sent,
          campaign_id,
          survey_id,
          responses:survey_responses!inner (
            status
          ),
          user:profiles!survey_assignments_user_id_fkey (
            id,
            email,
            first_name,
            last_name,
            user_sbus (
              id,
              is_primary,
              sbus:sbus (
                id,
                name
              )
            )
          )
        `)
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to include the status and correct user_sbus structure
      return data?.map(assignment => ({
        ...assignment,
        // Use the response status if available, otherwise default to 'assigned'
        status: (assignment.responses?.[0]?.status || 'assigned') as ResponseStatus,
        user: {
          ...assignment.user,
          user_sbus: assignment.user.user_sbus.map(userSbu => ({
            is_primary: userSbu.is_primary,
            sbu: userSbu.sbus // Rename sbus to sbu to match the expected type
          }))
        }
      })) || [];
    },
  });

  // Check for due dates and show notifications
  useEffect(() => {
    if (assignments) {
      const now = new Date();
      assignments.forEach(assignment => {
        const effectiveDueDate = assignment.active_instance?.ends_at || assignment.due_date;
        
        if (effectiveDueDate && assignment.status !== 'submitted') {
          const dueDate = new Date(effectiveDueDate);
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDue <= 3 && daysUntilDue > 0) {
            toast({
              title: "Survey Due Soon",
              description: `"${assignment.campaign?.name || assignment.survey.name}" is due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`,
              variant: "default",
            });
          }
          else if (daysUntilDue < 0 && assignment.status !== 'expired') {
            toast({
              title: "Survey Overdue",
              description: `"${assignment.campaign?.name || assignment.survey.name}" is overdue`,
              variant: "destructive",
            });
          }
        }
      });
    }
  }, [assignments, toast]);

  const handleSelectSurvey = async (id: string) => {
    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (roleData?.role === 'admin') {
      navigate(`/admin/my-surveys/${id}`);
    } else {
      navigate(`/user/my-surveys/${id}`);
    }
  };

  const filteredAssignments = assignments?.filter((assignment) => {
    // Filter out assignments with draft campaigns
    if (assignment.campaign?.status === 'draft') {
      return false;
    }

    const matchesSearch = 
      assignment.campaign?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.survey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.campaign?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.survey.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === "all" || 
      assignment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <SurveyFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
      />

      <ScrollArea className="h-[calc(100vh-14rem)]">
        <div className="space-y-4 p-4">
          {filteredAssignments?.map((assignment) => (
            <SurveyCard
              key={assignment.id}
              assignment={assignment}
              onSelect={handleSelectSurvey}
            />
          ))}
          {filteredAssignments?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No surveys found matching your criteria
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
