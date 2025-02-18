
import { useEffect, useState, useRef } from "react";
import { Model } from "survey-core";
import * as themes from "survey-core/themes";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SurveyStateData, isSurveyStateData } from "@/types/survey";
import { useNavigate } from "react-router-dom";
import { ResponseStatus } from "@/pages/admin/surveys/types/assignments";
import { Json } from "@/integrations/supabase/types";

interface UseSurveyResponseProps {
  id: string;
  viewType: 'user' | 'admin';
  surveyData: any;
  existingResponse: any;
  campaignInstanceId: string | null;
  initialTheme: ThemeSettings;
}

interface ThemeSettings {
  [key: string]: Json | undefined;
  baseTheme: string;
  isDark: boolean;
  isPanelless: boolean;
}

export function useSurveyResponse({
  id,
  viewType,
  surveyData,
  existingResponse,
  campaignInstanceId,
  initialTheme,
}: UseSurveyResponseProps) {
  const [survey, setSurvey] = useState<Model | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeSettings>(initialTheme);
  const surveyRef = useRef<Model | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Function to get theme instance
  const getThemeInstance = (themeSettings: ThemeSettings) => {
    const themeName = `${themeSettings.baseTheme}${themeSettings.isDark ? 'Dark' : 'Light'}${themeSettings.isPanelless ? 'Panelless' : ''}`;
    console.log("Getting theme instance for:", themeName);
    return (themes as any)[themeName];
  };

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

      // If there's an existing response, load it
      if (existingResponse?.response_data) {
        console.log("Loading existing response data");
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
        // Add autosave for non-submitted surveys
        surveyModel.onCurrentPageChanged.add(async (sender) => {
          try {
            const userId = (await supabase.auth.getUser()).data.user?.id;
            if (!userId) throw new Error("User not authenticated");

            const stateData = {
              lastPageNo: sender.currentPageNo,
              lastUpdated: new Date().toISOString()
            } as SurveyStateData;

            const responseData = {
              assignment_id: id,
              user_id: userId,
              response_data: sender.data,
              state_data: stateData,
              status: 'in_progress' as ResponseStatus,
              campaign_instance_id: campaignInstanceId,
            };

            const { error } = await supabase
              .from("survey_responses")
              .upsert(responseData, {
                onConflict: 'assignment_id,user_id'
              });

            if (error) throw error;
            console.log("Saved page state:", stateData);
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
                onConflict: 'assignment_id,user_id'
              });

            if (error) throw error;
            setLastSaved(new Date());
            console.log("Saved response data");
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
  }, [id, surveyData, existingResponse, campaignInstanceId, toast, initialTheme]); // removed currentTheme dependency

  // Handle only theme changes
  useEffect(() => {
    const currentSurvey = surveyRef.current;
    if (!currentSurvey) return;

    // Skip if theme hasn't actually changed
    if (JSON.stringify(currentTheme) === JSON.stringify(initialTheme)) return;

    console.log("Applying theme update:", currentTheme);
    const theme = getThemeInstance(currentTheme);
    if (theme) {
      console.log("Theme instance found, applying to existing survey");
      currentSurvey.applyTheme(theme);
      // No need to create a new model, just update the existing one
      setSurvey(currentSurvey);
    }
  }, [currentTheme, initialTheme]);

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
          onConflict: 'assignment_id,user_id'
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

  const handleThemeChange = ({ theme, themeSettings }: { theme: any; themeSettings: ThemeSettings }) => {
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
