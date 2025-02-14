
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
import { useState, useEffect, useCallback } from "react";

import "survey-core/defaultV2.min.css";

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
          campaign:survey_campaigns!survey_assignments_campaign_id_fkey (
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
      
      // Set initial mode based on submission status
      if (assignmentData.status === "submitted") {
        surveyModel.mode = 'display';
      }

      // Set up survey event handlers
      surveyModel.onCurrentPageChanged.add(() => {
        console.log("Current page changed:", surveyModel.currentPageNo);
      });

      surveyModel.onValueChanged.add(() => {
        console.log("Value changed:", surveyModel.data);
      });

      surveyModel.onComplete.add(() => {
        console.log("Survey completed");
      });

      setSurvey(surveyModel);
    }
  }, [assignmentData]);

  const handleThemeChange = useCallback((theme: any) => {
    if (survey) {
      try {
        // Apply theme without recreating the model
        survey.applyTheme(theme);
        // Just trigger a re-render without model recreation
        setSurvey({ ...survey });
      } catch (error) {
        console.error("Error applying theme:", error);
        toast({
          title: "Error applying theme",
          description: "There was an error applying the theme. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [survey, toast]);

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
        <ThemeSwitcher onThemeChange={handleThemeChange} />
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
