
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

  useEffect(() => {
    if (surveyData) {
      const surveyModel = new Model(surveyData);
      
      surveyModel.applyTheme(LayeredDarkPanelless);
      
      if (existingResponse?.response_data) {
        surveyModel.data = existingResponse.response_data;
        surveyModel.start();
        
        const stateData = existingResponse.state_data;
        if (stateData && isSurveyStateData(stateData)) {
          surveyModel.currentPageNo = stateData.lastPageNo;
        } else {
          surveyModel.currentPageNo = surveyModel.maxValidPageNo;
        }
      }

      if (existingResponse?.status === 'submitted') {
        surveyModel.mode = 'display';
      } else {
        surveyModel.onCurrentPageChanged.add(async (sender) => {
          try {
            const userId = (await supabase.auth.getUser()).data.user?.id;
            if (!userId) throw new Error("User not authenticated");

            const stateData = {
              lastPageNo: sender.currentPageNo,
              lastUpdated: new Date().toISOString()
            } as SurveyStateData;

            const { error } = await supabase
              .from("survey_responses")
              .upsert({
                assignment_id: id,
                user_id: userId,
                response_data: sender.data,
                state_data: stateData,
                status: 'in_progress' as ResponseStatus,
                campaign_instance_id: campaignInstanceId,
              }, {
                onConflict: campaignInstanceId
                  ? 'assignment_id,user_id,campaign_instance_id' 
                  : 'assignment_id,user_id'
              });

            if (error) throw error;
          } catch (error) {
            console.error("Error saving page state:", error);
          }
        });

        surveyModel.onValueChanged.add(async (sender) => {
          try {
            const userId = (await supabase.auth.getUser()).data.user?.id;
            if (!userId) throw new Error("User not authenticated");

            const responseData = {
              assignment_id: id,
              user_id: userId,
              response_data: sender.data,
              status: 'in_progress' as ResponseStatus,
              campaign_instance_id: campaignInstanceId,
            };

            const { error } = await supabase
              .from("survey_responses")
              .upsert(responseData, {
                onConflict: campaignInstanceId
                  ? 'assignment_id,user_id,campaign_instance_id' 
                  : 'assignment_id,user_id'
              });

            if (error) throw error;
            setLastSaved(new Date());
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
      const responseData = {
        assignment_id: id,
        user_id: userId,
        response_data: survey.data,
        status: 'submitted' as ResponseStatus,
        submitted_at: now,
        updated_at: now,
        campaign_instance_id: campaignInstanceId,
      };

      const { error: responseError } = await supabase
        .from("survey_responses")
        .upsert(responseData, {
          onConflict: campaignInstanceId
            ? 'assignment_id,user_id,campaign_instance_id' 
            : 'assignment_id,user_id'
        });

      if (responseError) throw responseError;

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

  return {
    survey,
    lastSaved,
    showSubmitDialog,
    setShowSubmitDialog,
    handleSubmitSurvey
  };
}
