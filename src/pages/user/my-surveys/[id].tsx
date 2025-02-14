import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { LayeredDarkPanelless } from "survey-core/themes";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ThemeSwitcher } from "@/components/shared/surveys/ThemeSwitcher";
import { SurveyStateData, isSurveyStateData } from "@/types/survey";
import { ResponseStatus } from "@/pages/admin/surveys/types/assignments";
import { useState, useEffect } from "react";

import "survey-core/defaultV2.min.css";

type SurveyAssignmentWithStatus = {
  id: string;
  survey_id: string;
  user_id: string;
  due_date: string | null;
  created_by: string;
  created_at: string | null;
  updated_at: string | null;
  is_organization_wide: boolean | null;
  campaign_id: string | null;
  status: ResponseStatus;
  survey: {
    id: string;
    name: string;
    description: string | null;
    json_data: any;
    status: string | null;
  };
  campaign?: {
    id: string;
    name: string;
  };
};

export default function UserSurveyResponsePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [survey, setSurvey] = useState<Model | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { data: assignmentData, isLoading } = useQuery({
    queryKey: ["survey-assignment", id],
    queryFn: async () => {
      const { data: assignmentData, error } = await supabase
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
        .maybeSingle();

      if (error) throw error;
      if (!assignmentData) throw new Error("Survey assignment not found");

      // Get the active instance for this assignment's campaign
      const { data: instance } = await supabase
        .from("campaign_instances")
        .select("id")
        .eq("campaign_id", assignmentData.campaign_id)
        .eq("status", "active")
        .single();

      // Get the assignment status using the instance
      const { data: assignmentStatus } = await supabase
        .rpc('get_instance_assignment_status', {
          p_assignment_id: assignmentData.id,
          p_instance_id: instance.id
        });

      return { 
        ...assignmentData, 
        status: assignmentStatus as ResponseStatus 
      };
    },
  });

  useEffect(() => {
    if (assignmentData?.survey?.json_data) {
      const surveyModel = new Model(assignmentData.survey.json_data);
      
      surveyModel.applyTheme(LayeredDarkPanelless);
      
      if (assignmentData.status === "submitted") {
        surveyModel.mode = 'display';
      }

      setSurvey(surveyModel);
    }
  }, [assignmentData]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!assignmentData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Survey not found or you don't have access to it.</p>
        <Button
          variant="ghost"
          onClick={() => navigate("/user/my-surveys")}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Surveys
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/user/my-surveys")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {assignmentData.campaign?.name || assignmentData.survey.name}
          </h1>
        </div>
        {lastSaved && (
          <p className="text-sm text-muted-foreground">
            Last saved: {lastSaved.toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <ThemeSwitcher onThemeChange={() => {}} />
      </div>
      
      <div className="bg-card rounded-lg border p-6">
        {survey ? (
          <Survey model={survey} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Unable to load survey. Please try again later.
          </div>
        )}
      </div>
    </div>
  );
}
