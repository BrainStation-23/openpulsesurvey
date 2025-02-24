
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import SurveyFilters from "./components/SurveyFilters";
import CampaignGroup from "./components/CampaignGroup";
import { Tour } from "@/components/onboarding/Tour";
import { TourButton } from "@/components/onboarding/TourButton";
import { ResponseStatus, UserSurvey } from "@/pages/admin/surveys/types/user-surveys";

interface CampaignGroup {
  campaign_id: string;
  name: string;
  description?: string | null;
  instances: UserSurvey[];
}

export default function MySurveysList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>(["assigned", "in_progress"]);
  
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

  // Group and filter surveys
  const groupedAndFilteredSurveys = userSurveys?.reduce<CampaignGroup[]>((groups, survey) => {
    // Apply search and status filters at the instance level
    const matchesSearch = 
      survey.survey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (survey.survey.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter.length === 0 || 
      statusFilter.includes(survey.status);

    if (!matchesSearch || !matchesStatus) return groups;

    // Find existing group or create new one
    let group = groups.find(g => g.campaign_id === survey.campaign_id);
    
    if (!group) {
      group = {
        campaign_id: survey.campaign_id,
        name: survey.survey.name,
        description: survey.survey.description,
        instances: []
      };
      groups.push(group);
    }

    group.instances.push(survey);
    return groups;
  }, []) || [];

  // Sort instances within each group by period number
  groupedAndFilteredSurveys.forEach(group => {
    group.instances.sort((a, b) => 
      (b.instance.period_number || 0) - (a.instance.period_number || 0)
    );
  });

  // Sort campaigns by next due date
  groupedAndFilteredSurveys.sort((a, b) => {
    const aNextDue = a.instances
      .filter(i => i.status !== 'submitted' && i.instance.ends_at)
      .map(i => new Date(i.instance.ends_at!))
      .sort((x, y) => x.getTime() - y.getTime())[0];
    
    const bNextDue = b.instances
      .filter(i => i.status !== 'submitted' && i.instance.ends_at)
      .map(i => new Date(i.instance.ends_at!))
      .sort((x, y) => x.getTime() - y.getTime())[0];

    if (!aNextDue && !bNextDue) return 0;
    if (!aNextDue) return 1;
    if (!bNextDue) return -1;
    return aNextDue.getTime() - bNextDue.getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">My Surveys</h2>
        <TourButton tourId="my_surveys_guide" title="My Surveys Guide" />
      </div>

      <div className="search-filters">
        <SurveyFilters
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          isLoading={isLoading}
        />
      </div>

      <ScrollArea className="h-[calc(100vh-14rem)]">
        <div className="space-y-4 p-4">
          {groupedAndFilteredSurveys.map((group) => (
            <div key={group.campaign_id} className="campaign-group">
              <CampaignGroup
                campaignId={group.campaign_id}
                name={group.name}
                description={group.description}
                instances={group.instances}
                onSelectSurvey={handleSelectSurvey}
              />
            </div>
          ))}
          {groupedAndFilteredSurveys.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No surveys found matching your criteria
            </div>
          )}
        </div>
      </ScrollArea>
      <Tour />
    </div>
  );
}
