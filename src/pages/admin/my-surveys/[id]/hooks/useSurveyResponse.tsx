
import { useEffect, useState } from "react";
import { Model } from "survey-core";
import { LayeredDarkPanelless } from "survey-core/themes";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SurveyStateData, isSurveyStateData } from "@/types/survey";
import { useNavigate } from "react-router-dom";
import { ResponseStatus } from "@/pages/admin/surveys/types/assignments";

interface UseSurveyResponseProps {
  id: string;
  surveyData: any;
  existingResponse: any;
  campaignInstanceId: string | null;
}

export function useSurveyResponse({
  id,
  surveyData,
  existingResponse,
  campaignInstanceId,
}: UseSurveyResponseProps) {
  const [survey, setSurvey] = useState<Model | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Debounced save function
  let saveTimeout: NodeJS.Timeout | null = null;

  const saveResponse = async (
    userId: string,
    responseData: any,
    stateData?: SurveyStateData,
    status: ResponseStatus = 'in_progress'
  ) => {
    try {
      // First try to get any existing response with the correct composite key
      const { data: existingResponse } = await supabase
        .from("survey_responses")
        .select("id")
        .eq("assignment_id", id)
        .eq("user_id", userId)
        .eq("campaign_instance_id", campaignInstanceId)
        .maybeSingle();

      if (existingResponse) {
        // Update existing response
        const { error: updateError } = await supabase
          .from("survey_responses")
          .update({
            response_data: responseData,
            state_data: stateData || {},
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingResponse.id);

        if (updateError) throw updateError;
      } else {
        // Insert new response
        const { error: insertError } = await supabase
          .from("survey_responses")
          .insert({
            assignment_id: id,
            user_id: userId,
            response_data: responseData,
            state_data: stateData || {},
            status,
            campaign_instance_id: campaignInstanceId,
          });

        if (insertError) throw insertError;
      }

      setLastSaved(new Date());
      console.log("Successfully saved response");
    } catch (error) {
      console.error("Error saving response:", error);
      throw error;
    }
  };

  const debouncedSave = (
    userId: string,
    responseData: any,
    stateData?: SurveyStateData,
    status: ResponseStatus = 'in_progress'
  ) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    saveTimeout = setTimeout(async () => {
      try {
        await saveResponse(userId, responseData, stateData, status);
      } catch (error) {
        console.error("Error in debounced save:", error);
        toast({
          title: "Error saving progress",
          description: "There was an error saving your progress. Please try again.",
          variant: "destructive",
        });
      }
    }, 500); // 500ms debounce
  };

  useEffect(() => {
    if (surveyData) {
      const surveyModel = new Model(surveyData);
      surveyModel.applyTheme(LayeredDarkPanelless);

      // If there's an existing response, load it
      if (existingResponse?.response_data) {
        console.log("Loading existing response data:", existingResponse.response_data);
        surveyModel.data = existingResponse.response_data;
        surveyModel.start();
        
        // Restore the last page from state data
        const stateData = existingResponse.state_data;
        if (stateData && isSurveyStateData(stateData)) {
          console.log("Restoring to page:", stateData.lastPageNo);
          surveyModel.currentPageNo = stateData.lastPageNo;
        }
      }

      // If the response is submitted, make it read-only
      if (existingResponse?.status === 'submitted') {
        surveyModel.mode = 'display';
      } else {
        // Add autosave for non-submitted surveys with debouncing
        surveyModel.onCurrentPageChanged.add(async (sender) => {
          try {
            const userId = (await supabase.auth.getUser()).data.user?.id;
            if (!userId) throw new Error("User not authenticated");

            const stateData = {
              lastPageNo: sender.currentPageNo,
              lastUpdated: new Date().toISOString()
            } as SurveyStateData;

            debouncedSave(userId, sender.data, stateData);
          } catch (error) {
            console.error("Error saving page state:", error);
          }
        });

        surveyModel.onValueChanged.add(async (sender) => {
          try {
            const userId = (await supabase.auth.getUser()).data.user?.id;
            if (!userId) throw new Error("User not authenticated");

            debouncedSave(userId, sender.data);
          } catch (error) {
            console.error("Error saving response:", error);
            toast({
              title: "Error saving response",
              description: "Your progress could not be saved. Please try again.",
              variant: "destructive",
            });
          }
        });

        surveyModel.onComplete.add(() => {
          setShowSubmitDialog(true);
        });
      }

      setSurvey(surveyModel);
    }
  }, [id, surveyData, existingResponse, campaignInstanceId, toast]);

  const handleSubmitSurvey = async () => {
    if (!survey) return;
    
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error("User not authenticated");

      const now = new Date().toISOString();
      
      // Use the same consistent save pattern for submission
      await saveResponse(
        userId,
        survey.data,
        undefined,
        'submitted' as ResponseStatus
      );

      // Also update the submitted_at timestamp
      const { data: existingResponse } = await supabase
        .from("survey_responses")
        .select("id")
        .eq("assignment_id", id)
        .eq("user_id", userId)
        .eq("campaign_instance_id", campaignInstanceId)
        .maybeSingle();

      if (existingResponse) {
        await supabase
          .from("survey_responses")
          .update({
            submitted_at: now,
            updated_at: now
          })
          .eq("id", existingResponse.id);
      }

      toast({
        title: "Survey completed",
        description: "Your response has been submitted successfully.",
      });

      navigate("/admin/my-surveys");
    } catch (error) {
      console.error("Error submitting response:", error);
      toast({
        title: "Error submitting response",
        description: "Your response could not be submitted. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleThemeChange = (theme: any) => {
    if (survey) {
      survey.applyTheme(theme);
      // Force a re-render since the theme change doesn't trigger one automatically
      setSurvey(new Model({ ...survey.toJSON() }));
    }
  };

  return {
    survey,
    lastSaved,
    showSubmitDialog,
    setShowSubmitDialog,
    handleSubmitSurvey,
    handleThemeChange
  };
}
