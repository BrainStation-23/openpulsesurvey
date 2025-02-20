
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

      const { data, error } = await supabase
        .rpc('get_my_survey_assignments', {
          p_user_id: userId
        });

      if (error) throw error;

      return data as UserSurvey[];
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

  const handleSelectSurvey = async (survey: UserSurvey) => {
    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (roleData?.role === 'admin') {
      navigate(`/admin/my-surveys/${survey.id}/${survey.instance.id}`);
    } else {
      navigate(`/user/my-surveys/${survey.id}/${survey.instance.id}`);
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
              key={survey.instance.unique_key || `${survey.id}_${survey.instance.period_number}`}
              survey={survey}
              onSelect={() => handleSelectSurvey(survey)}
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
