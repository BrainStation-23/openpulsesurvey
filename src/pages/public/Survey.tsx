
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { LayeredDarkPanelless } from "survey-core/themes";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ThemeSwitcher } from "@/components/shared/surveys/ThemeSwitcher";
import * as themes from "survey-core/themes";

import "survey-core/defaultV2.min.css";

const getThemeInstance = (themeSettings: any) => {
  const themeName = `${themeSettings.baseTheme}${themeSettings.isDark ? 'Dark' : 'Light'}${themeSettings.isPanelless ? 'Panelless' : ''}`;
  return (themes as any)[themeName];
};

export default function PublicSurveyPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [survey, setSurvey] = useState<Model | null>(null);

  // Query to fetch assignment and check for existing response
  const { data: assignmentData, isLoading } = useQuery({
    queryKey: ["public-survey", token],
    queryFn: async () => {
      // First get the assignment with campaign info
      const { data: assignment, error: assignmentError } = await supabase
        .from("survey_assignments")
        .select(`
          *,
          survey:surveys (
            id,
            name,
            description,
            json_data,
            theme_settings,
            status
          ),
          campaign:survey_campaigns!survey_assignments_campaign_id_fkey (
            id,
            name,
            is_recurring,
            status
          )
        `)
        .eq("public_access_token", token)
        .maybeSingle();

      if (assignmentError) throw assignmentError;
      if (!assignment) throw new Error("Survey not found");

      // Get active instance if there is a campaign
      let activeInstance = null;
      if (assignment.campaign_id) {
        const { data: instance, error: instanceError } = await supabase
          .from("campaign_instances")
          .select("*")
          .eq("campaign_id", assignment.campaign_id)
          .eq("status", 'active')
          .order("period_number", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (instanceError) throw instanceError;
        activeInstance = instance;
      }

      // Check for existing response using the active instance
      const { data: existingResponse, error: responseError } = await supabase
        .from("survey_responses")
        .select("submitted_at")
        .eq("assignment_id", assignment.id)
        .eq("campaign_instance_id", activeInstance?.id)
        .not("submitted_at", "is", null)
        .maybeSingle();

      if (responseError) throw responseError;

      return {
        assignment,
        activeInstance,
        existingResponse
      };
    },
  });

  useEffect(() => {
    if (assignmentData?.assignment?.survey?.json_data && !assignmentData.existingResponse) {
      const surveyModel = new Model(assignmentData.assignment.survey.json_data);
      
      // Apply theme settings
      if (assignmentData.assignment.survey.theme_settings) {
        const theme = getThemeInstance(assignmentData.assignment.survey.theme_settings);
        if (theme) {
          surveyModel.applyTheme(theme);
        }
      } else {
        surveyModel.applyTheme(LayeredDarkPanelless);
      }
      
      surveyModel.onComplete.add(async (sender) => {
        try {
          const responseData = {
            assignment_id: assignmentData.assignment.id,
            user_id: assignmentData.assignment.user_id,
            response_data: sender.data,
            status: 'submitted' as const,
            campaign_instance_id: assignmentData.activeInstance?.id || null,
            submitted_at: new Date().toISOString(),
          };

          const { error: responseError } = await supabase
            .from("survey_responses")
            .insert(responseData);

          if (responseError) throw responseError;

          toast({
            title: "Survey completed",
            description: "Your response has been submitted successfully. Thank you!",
          });

          navigate(`/public/survey/${token}/thank-you`);
        } catch (error) {
          console.error("Error submitting response:", error);
          toast({
            title: "Error submitting response",
            description: "Your response could not be submitted. Please try again.",
            variant: "destructive",
          });
        }
      });

      setSurvey(surveyModel);
    }
  }, [assignmentData, navigate, toast, token]);

  const handleThemeChange = (theme: any) => {
    if (survey) {
      survey.applyTheme(theme);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!assignmentData?.assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Survey Not Found</h1>
        <p className="text-muted-foreground">
          The survey you're looking for doesn't exist or has expired.
        </p>
      </div>
    );
  }

  // Check if campaign is active when there is a campaign
  if (assignmentData.assignment.campaign && assignmentData.assignment.campaign.status !== 'active') {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Survey Not Available</AlertTitle>
            <AlertDescription>
              This survey is not currently active. Please try again later or contact the survey administrator.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Check if there's an active instance when there is a campaign
  if (assignmentData.assignment.campaign && !assignmentData.activeInstance) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Survey Not Available</AlertTitle>
            <AlertDescription>
              There is no active survey period at the moment. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (assignmentData.existingResponse) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Already Submitted</AlertTitle>
            <AlertDescription>
              You have already submitted your response to this survey on{" "}
              {new Date(assignmentData.existingResponse.submitted_at).toLocaleDateString()}{" "}
              at{" "}
              {new Date(assignmentData.existingResponse.submitted_at).toLocaleTimeString()}.
              <br />
              <br />
              Thank you for your participation!
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{assignmentData.assignment.survey.name}</h1>
        {assignmentData.assignment.survey.description && (
          <p className="text-muted-foreground mb-8">{assignmentData.assignment.survey.description}</p>
        )}
        <div className="flex justify-end mb-6">
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
    </div>
  );
}
