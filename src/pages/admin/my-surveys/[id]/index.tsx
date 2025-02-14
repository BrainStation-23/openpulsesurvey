
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Survey } from "survey-react-ui";
import { LayeredDarkPanelless } from "survey-core/themes";
import { supabase } from "@/integrations/supabase/client";
import { ThemeSwitcher } from "@/components/shared/surveys/ThemeSwitcher";
import { SurveyHeader } from "./components/SurveyHeader";
import { SubmitDialog } from "./components/SubmitDialog";
import { useSurveyResponse } from "./hooks/useSurveyResponse";

import "survey-core/defaultV2.min.css";

export default function SurveyResponsePage() {
  const { id } = useParams();

  const { data: assignment, isLoading } = useQuery({
    queryKey: ["survey-assignment", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_assignments")
        .select(`
          *,
          survey:surveys (
            id,
            name,
            description,
            json_data,
            status
          ),
          campaign:survey_campaigns (
            id,
            name
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: activeInstance } = useQuery({
    queryKey: ["active-campaign-instance", assignment?.campaign_id],
    enabled: !!assignment?.campaign_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_instances")
        .select("*")
        .eq("campaign_id", assignment.campaign_id)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: existingResponse } = useQuery({
    queryKey: ["survey-response", id, activeInstance?.id],
    queryFn: async () => {
      const query = supabase
        .from("survey_responses")
        .select("*")
        .eq("assignment_id", id);

      if (activeInstance?.id) {
        query.eq("campaign_instance_id", activeInstance.id);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const {
    survey,
    lastSaved,
    showSubmitDialog,
    setShowSubmitDialog,
    handleSubmitSurvey
  } = useSurveyResponse({
    id: id!,
    surveyData: assignment?.survey?.json_data,
    existingResponse,
    assignmentStatus: assignment?.status,
    campaignInstanceId: activeInstance?.id || null,
  });

  if (isLoading || !survey) {
    return <div>Loading...</div>;
  }

  const handleThemeChange = (theme: any) => {
    if (survey) {
      survey.applyTheme(theme);
    }
  };

  return (
    <div className="space-y-6">
      <SurveyHeader 
        title={assignment.campaign?.name || assignment.survey.name}
        lastSaved={lastSaved}
      />

      <div className="flex justify-end">
        <ThemeSwitcher onThemeChange={handleThemeChange} />
      </div>
      
      <div className="bg-card rounded-lg border p-6">
        <Survey model={survey} />
      </div>

      <SubmitDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        onSubmit={handleSubmitSurvey}
      />
    </div>
  );
}
