
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
import { ResponseStatus, Assignment } from "@/pages/admin/surveys/types/assignments";

export default function MySurveysList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: assignments, isLoading } = useQuery({
    queryKey: ["my-survey-assignments"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) throw new Error("No user found");

      const { data, error } = await supabase
        .from("survey_assignments")
        .select(`
          id,
          survey_id,
          campaign_id,
          user_id,
          created_by,
          created_at,
          updated_at,
          public_access_token,
          last_reminder_sent,
          responses:survey_responses!inner (
            status,
            campaign_instance_id
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
          ),
          survey:surveys (
            id,
            name,
            description,
            json_data
          ),
          campaign:survey_campaigns (
            id,
            name,
            description,
            status
          ),
          active_instance:campaign_instances!inner (
            id,
            starts_at,
            ends_at,
            status
          )
        `)
        .eq("user_id", userId)
        .eq('active_instance.status', 'active')
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data?.map(assignment => ({
        ...assignment,
        id: assignment.id,
        survey_id: assignment.survey_id,
        campaign_id: assignment.campaign_id,
        user_id: assignment.user_id,
        created_by: assignment.created_by,
        created_at: assignment.created_at,
        updated_at: assignment.updated_at,
        public_access_token: assignment.public_access_token,
        last_reminder_sent: assignment.last_reminder_sent,
        status: (assignment.responses?.[0]?.status || 'assigned') as ResponseStatus,
        user: {
          ...assignment.user,
          user_sbus: assignment.user.user_sbus.map(userSbu => ({
            is_primary: userSbu.is_primary,
            sbu: userSbu.sbus
          }))
        },
        campaign: assignment.campaign && {
          ...assignment.campaign,
          ends_at: assignment.active_instance?.ends_at,
          starts_at: assignment.active_instance?.starts_at
        },
        survey: assignment.survey
      })) as Assignment[];
    },
  });

  // Check for due dates and show notifications
  useEffect(() => {
    if (assignments) {
      const now = new Date();
      assignments.forEach(assignment => {
        const effectiveEndDate = assignment.campaign?.ends_at;
        
        if (effectiveEndDate && assignment.status !== 'submitted') {
          const dueDate = new Date(effectiveEndDate);
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDue <= 3 && daysUntilDue > 0) {
            toast({
              title: "Survey Due Soon",
              description: `"${assignment.campaign?.name || assignment.survey?.name}" is due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`,
              variant: "default",
            });
          }
          else if (daysUntilDue < 0 && assignment.status !== 'expired') {
            toast({
              title: "Survey Overdue",
              description: `"${assignment.campaign?.name || assignment.survey?.name}" is overdue`,
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
    const matchesSearch = 
      assignment.campaign?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.survey?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.campaign?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.survey?.description?.toLowerCase().includes(searchQuery.toLowerCase());

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
