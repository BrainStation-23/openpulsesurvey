
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

  const setupAutoSave = (surveyModel: Model) => {
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
  };

  return { setupAutoSave };
}
