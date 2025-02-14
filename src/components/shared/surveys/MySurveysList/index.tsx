
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import SurveyCard from "./SurveyCard";
import SurveyFilters from "./components/SurveyFilters";
import { ResponseStatus, Assignment } from "@/pages/admin/surveys/types/assignments";

function determineStatus(assignment: Partial<Assignment> & { 
  instance: Assignment["instance"],
  response?: Assignment["response"]
}): ResponseStatus {
  // If there's a response for this instance, use its status
  if (assignment.response?.status) {
    return assignment.response.status;
  }
  
  // No response but instance ended
  if (new Date(assignment.instance.ends_at) < new Date()) {
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
  
  const { data: assignments, isLoading } = useQuery({
    queryKey: ["my-survey-assignments"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) throw new Error("No user found");

      type DbResponse = {
        id: string;
        survey_id: string;
        campaign_id: string | null;
        user_id: string;
        created_by: string;
        created_at: string;
        updated_at: string;
        public_access_token: string;
        last_reminder_sent: string | null;
        responses: Array<{
          status: ResponseStatus;
          campaign_instance_id: string;
        }> | null;
        survey: {
          id: string;
          name: string;
          description: string | null;
          json_data: any;
        };
        instance: {
          id: string;
          starts_at: string;
          ends_at: string;
          status: "upcoming" | "active" | "completed";
        };
      };

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
          instance:campaign_instances!inner (
            id,
            starts_at,
            ends_at,
            status
          )
        `)
        .eq("user_id", userId)
        .eq('instance.status', 'active')
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data as DbResponse[])?.map(assignment => {
        const status = determineStatus({
          instance: assignment.instance,
          response: assignment.responses?.[0]
        });

        const mappedAssignment: Assignment = {
          id: assignment.id,
          survey_id: assignment.survey_id,
          campaign_id: assignment.campaign_id,
          user_id: assignment.user_id,
          created_by: assignment.created_by,
          created_at: assignment.created_at,
          updated_at: assignment.updated_at,
          public_access_token: assignment.public_access_token,
          last_reminder_sent: assignment.last_reminder_sent,
          instance: {
            id: assignment.instance.id,
            starts_at: assignment.instance.starts_at,
            ends_at: assignment.instance.ends_at,
            status: assignment.instance.status
          },
          survey: assignment.survey,
          status,
        };

        if (assignment.responses?.[0]) {
          mappedAssignment.response = {
            status: assignment.responses[0].status,
            campaign_instance_id: assignment.responses[0].campaign_instance_id
          };
        }

        return mappedAssignment;
      }) as Assignment[];
    },
  });

  // Check for due dates and show notifications
  useEffect(() => {
    if (assignments) {
      const now = new Date();
      assignments.forEach(assignment => {
        const effectiveEndDate = assignment.instance.ends_at;
        
        if (effectiveEndDate && assignment.status !== 'submitted') {
          const dueDate = new Date(effectiveEndDate);
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDue <= 3 && daysUntilDue > 0) {
            toast({
              title: "Survey Due Soon",
              description: `"${assignment.survey.name}" is due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`,
              variant: "default",
            });
          }
          else if (daysUntilDue < 0 && assignment.status !== 'expired') {
            toast({
              title: "Survey Overdue",
              description: `"${assignment.survey.name}" is overdue`,
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
      assignment.survey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (assignment.survey.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());

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
