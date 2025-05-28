
import { Model } from "survey-core";
import { supabase } from "@/integrations/supabase/client";
import { SurveyStateData } from "@/types/survey";
import { ResponseStatus } from "@/pages/admin/surveys/types/assignments";
import { useToast } from "@/hooks/use-toast";
import { Dispatch, SetStateAction } from "react";

export function useAutoSave(
  id: string,
  campaignInstanceId: string | null,
  setLastSaved: Dispatch<SetStateAction<Date | null>>,
) {
  const { toast } = useToast();

  const saveResponse = async (
    userId: string,
    responseData: any,
    stateData?: SurveyStateData,
    status: ResponseStatus = 'in_progress'
  ) => {
    try {
      // Use INSERT ... ON CONFLICT to avoid race conditions
      const { error } = await supabase
        .from("survey_responses")
        .upsert({
          assignment_id: id,
          user_id: userId,
          response_data: responseData,
          state_data: stateData || {},
          status,
          campaign_instance_id: campaignInstanceId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'assignment_id,user_id,campaign_instance_id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      setLastSaved(new Date());
      console.log("Successfully saved response using upsert");
    } catch (error) {
      console.error("Error saving response:", error);
      throw error;
    }
  };

  const setupAutoSave = (surveyModel: Model) => {
    if (!campaignInstanceId) {
      console.error("Cannot setup autosave without campaign instance ID");
      return;
    }

    // Handle page changes
    surveyModel.onCurrentPageChanged.add(async (sender) => {
      try {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (!userId) throw new Error("User not authenticated");

        const stateData = {
          lastPageNo: sender.currentPageNo,
          lastUpdated: new Date().toISOString()
        } as SurveyStateData;

        await saveResponse(userId, sender.data, stateData);
      } catch (error) {
        console.error("Error saving page state:", error);
        toast({
          title: "Error saving progress",
          description: "There was an error saving your progress. Please try again.",
          variant: "destructive",
        });
      }
    });

    // Handle value changes with debouncing to reduce conflicts
    let saveTimeout: NodeJS.Timeout;
    surveyModel.onValueChanged.add(async (sender) => {
      // Clear previous timeout to debounce rapid changes
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      // Debounce saves by 1 second to reduce race conditions
      saveTimeout = setTimeout(async () => {
        try {
          const userId = (await supabase.auth.getUser()).data.user?.id;
          if (!userId) throw new Error("User not authenticated");

          await saveResponse(userId, sender.data);
        } catch (error) {
          console.error("Error saving response:", error);
          toast({
            title: "Error saving response",
            description: "Your progress could not be saved. Please try again.",
            variant: "destructive",
          });
        }
      }, 1000);
    });
  };

  return { setupAutoSave };
}
