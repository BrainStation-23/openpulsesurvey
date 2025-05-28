
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
      // First try to get any existing response
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

    // Handle value changes
    surveyModel.onValueChanged.add(async (sender) => {
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
    });
  };

  return { setupAutoSave };
}
