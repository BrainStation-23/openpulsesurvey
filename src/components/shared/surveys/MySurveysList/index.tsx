
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import SurveyCard from "./SurveyCard";
import SurveyFilters from "./components/SurveyFilters";
import { ResponseStatus, UserSurvey } from "@/pages/admin/surveys/types/user-surveys";

function determineStatus(survey: Partial<UserSurvey> & { 
  instance: UserSurvey["instance"],
  response?: UserSurvey["response"]
}): ResponseStatus {
  // If there's a response for this instance, use its status
  if (survey.response?.status) {
    return survey.response.status;
  }
  
  // No response but instance ended
  if (new Date(survey.instance.ends_at) < new Date()) {
    return 'expired';
  }
  
  // Active instance, no response
  return 'assigned';
}

export default function MySurveysList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: userSurveys, isLoading } = useQuery({
    queryKey: ["my-survey-assignments"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) throw new Error("No user found");

      // First, get the active campaign instances
      const { data: activeInstances, error: instanceError } = await supabase
        .from('campaign_instances')
        .select('id, campaign_id, starts_at, ends_at, status')
        .eq('status', 'active');

      if (instanceError) throw instanceError;

      // Then get assignments with their related data
      const { data: assignments, error: assignmentError } = await supabase
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
          responses:survey_responses (
            status,
            campaign_instance_id
          ),
          survey:surveys (
            id,
            name,
            description,
            json_data
          ),
          campaign:survey_campaigns!survey_assignments_campaign_id_fkey (
            id,
            name
          )
        `)
        .eq("user_id", userId)
        .in('campaign_id', activeInstances.map(instance => instance.campaign_id));

      if (assignmentError) throw assignmentError;

      // Map the data to include active instances
      return assignments.map(assignment => {
        const activeInstance = activeInstances.find(
          instance => instance.campaign_id === assignment.campaign_id
        );
        
        if (!activeInstance) return null;

        const status = determineStatus({
          instance: activeInstance,
          response: assignment.responses?.[0]
        });

        const userSurvey: UserSurvey = {
          id: assignment.id,
          survey_id: assignment.survey_id,
          campaign_id: assignment.campaign_id,
          user_id: assignment.user_id,
          created_by: assignment.created_by,
          created_at: assignment.created_at,
          updated_at: assignment.updated_at,
          public_access_token: assignment.public_access_token,
          last_reminder_sent: assignment.last_reminder_sent,
          instance: activeInstance,
          survey: assignment.survey,
          status
        };

        if (assignment.responses?.[0]) {
          userSurvey.response = {
            status: assignment.responses[0].status,
            campaign_instance_id: assignment.responses[0].campaign_instance_id
          };
        }

        return userSurvey;
      }).filter(Boolean) as UserSurvey[]; // Filter out null values and cast to UserSurvey[]
    },
  });

  // Check for due dates and show notifications
  useEffect(() => {
    if (userSurveys) {
      const now = new Date();
      userSurveys.forEach(survey => {
        const effectiveEndDate = survey.instance.ends_at;
        
        if (effectiveEndDate && survey.status !== 'submitted') {
          const dueDate = new Date(effectiveEndDate);
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDue <= 3 && daysUntilDue > 0) {
            toast({
              title: "Survey Due Soon",
              description: `"${survey.survey.name}" is due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`,
              variant: "default",
            });
          }
          else if (daysUntilDue < 0 && survey.status !== 'expired') {
            toast({
              title: "Survey Overdue",
              description: `"${survey.survey.name}" is overdue`,
              variant: "destructive",
            });
          }
        }
      });
    }
  }, [userSurveys, toast]);

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

  const filteredSurveys = userSurveys?.filter((survey) => {
    const matchesSearch = 
      survey.survey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (survey.survey.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === "all" || 
      survey.status === statusFilter;

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
          {filteredSurveys?.map((survey) => (
            <SurveyCard
              key={survey.id}
              survey={survey}
              onSelect={handleSelectSurvey}
            />
          ))}
          {filteredSurveys?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No surveys found matching your criteria
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
