
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
  
  // Use the centralized auto-save hook
  const { setupAutoSave, saveResponse } = useAutoSave(id, campaignInstanceId, setLastSaved);

  useEffect(() => {
    if (!surveyData || !campaignInstanceId) return;

    try {
      console.log("Initializing survey with initial theme:", initialTheme);
      
      const surveyModel = new Model(surveyData);
      const theme = getThemeInstance(initialTheme);
      if (theme) {
        console.log("Applying initial theme");
        surveyModel.applyTheme(theme);
      }

      const matchingResponse = existingResponse?.campaign_instance_id === campaignInstanceId;
      console.log("Checking for matching response:", { 
        existingInstanceId: existingResponse?.campaign_instance_id,
        currentInstanceId: campaignInstanceId,
        hasMatch: matchingResponse
      });

      if (matchingResponse && existingResponse?.response_data) {
        console.log("Loading existing response data for instance:", campaignInstanceId);
        surveyModel.data = existingResponse.response_data;
        surveyModel.start();
        
        const stateData = existingResponse.state_data;
        if (stateData && isSurveyStateData(stateData)) {
          console.log("Restoring to page:", stateData.lastPageNo);
          surveyModel.currentPageNo = stateData.lastPageNo;
        }

        if (existingResponse.status === 'submitted') {
          console.log("Setting survey to read-only mode");
          surveyModel.mode = 'display';
        }
      }

      if (surveyModel.mode !== 'display') {
        console.log("Setting up centralized autosave");
        
        // Use the centralized auto-save setup
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
  }, [id, surveyData, existingResponse, campaignInstanceId, toast, initialTheme, setupAutoSave, getThemeInstance]);

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
    if (!survey || !campaignInstanceId) return;
    
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error("User not authenticated");

      const now = new Date().toISOString();

      // Use the centralized save function for submission
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

export type * from './types';
