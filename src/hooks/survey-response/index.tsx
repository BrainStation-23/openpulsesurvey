
import { useEffect, useState, useRef } from "react";
import { Model } from "survey-core";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isSurveyStateData } from "@/types/survey";
import { useNavigate } from "react-router-dom";
import { ResponseStatus } from "@/pages/admin/surveys/types/assignments";
import { useTheme } from "./useTheme";
import { useAutoSave } from "./useAutoSave";
import type { 
  UseSurveyResponseProps, 
  UseSurveyResponseResult,
  ThemeChangeEvent 
} from "./types";

export function useSurveyResponse({
  id,
  viewType,
  surveyData,
  existingResponse,
  campaignInstanceId,
  initialTheme,
}: UseSurveyResponseProps): UseSurveyResponseResult {
  const [survey, setSurvey] = useState<Model | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const surveyRef = useRef<Model | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { currentTheme, setCurrentTheme, getThemeInstance } = useTheme(initialTheme);
  const { setupAutoSave } = useAutoSave(id, campaignInstanceId, setLastSaved);

  // Initialize survey once
  useEffect(() => {
    if (!surveyData) return;

    try {
      console.log("Initializing survey with initial theme:", initialTheme);
      
      // Create survey model with initial theme
      const surveyModel = new Model(surveyData);
      const theme = getThemeInstance(initialTheme);
      if (theme) {
        console.log("Applying initial theme");
        surveyModel.applyTheme(theme);
      }

      // Only load existing response if it matches the current instance
      if (existingResponse?.response_data && existingResponse.campaign_instance_id === campaignInstanceId) {
        console.log("Loading existing response data for instance:", campaignInstanceId);
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
      if (existingResponse?.status === 'submitted' && existingResponse.campaign_instance_id === campaignInstanceId) {
        surveyModel.mode = 'display';
      } else {
        // Add autosave for non-submitted surveys
        setupAutoSave(surveyModel);
        surveyModel.onComplete.add(() => {
          setShowSubmitDialog(true);
        });
      }

      surveyRef.current = surveyModel;
      setSurvey(surveyModel);
    } catch (error) {
      console.error("Error initializing survey:", error);
      toast({
        title: "Error loading survey",
        description: "Could not load the survey. Please try again.",
        variant: "destructive",
      });
    }
  }, [id, surveyData, existingResponse, campaignInstanceId, toast, initialTheme]);

  // Handle theme changes
  useEffect(() => {
    const currentSurvey = surveyRef.current;
    if (!currentSurvey) return;

    if (JSON.stringify(currentTheme) === JSON.stringify(initialTheme)) return;

    console.log("Applying theme update:", currentTheme);
    const theme = getThemeInstance(currentTheme);
    if (theme) {
      console.log("Theme instance found, applying to existing survey");
      currentSurvey.applyTheme(theme);
      setSurvey(currentSurvey);
    }
  }, [currentTheme, initialTheme, getThemeInstance]);

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
          onConflict: 'assignment_id,user_id,campaign_instance_id'
        });

      if (responseError) throw responseError;

      toast({
        title: "Survey completed",
        description: "Your response has been submitted successfully.",
      });

      navigate(`/${viewType}/my-surveys`);
    } catch (error) {
      console.error("Error submitting response:", error);
      toast({
        title: "Error submitting response",
        description: "Your response could not be submitted. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleThemeChange = ({ themeSettings }: ThemeChangeEvent) => {
    console.log("Theme change received:", themeSettings);
    setCurrentTheme(themeSettings);
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

// Re-export types
export type * from './types';
