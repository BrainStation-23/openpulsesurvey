
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { LayeredDarkPanelless } from "survey-core/themes";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SurveyStateData, isSurveyStateData } from "@/types/survey";
import { ThemeSwitcher } from "@/components/shared/surveys/ThemeSwitcher";
import { useSurveyResponse } from "./hooks/useSurveyResponse";
import { SubmitDialog } from "./components/SubmitDialog";

import "survey-core/defaultV2.min.css";

export default function UserSurveyResponsePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: assignmentData, isLoading } = useQuery({
    queryKey: ["survey-assignment-with-response", id],
    queryFn: async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error("User not authenticated");

      const { data: assignment, error: assignmentError } = await supabase
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

      if (assignmentError) throw assignmentError;
      if (!assignment) throw new Error("Survey assignment not found");

      // Fetch the latest response for this assignment
      const { data: response, error: responseError } = await supabase
        .from("survey_responses")
        .select("*")
        .eq("assignment_id", assignment.id)
        .eq("user_id", user.data.user.id)
        .order("updated_at", { ascending: false })
        .maybeSingle();

      if (responseError) throw responseError;

      return {
        assignment,
        existingResponse: response
      };
    },
  });

  const {
    survey,
    lastSaved,
    showSubmitDialog,
    setShowSubmitDialog,
    handleSubmitSurvey,
    handleThemeChange
  } = useSurveyResponse({
    id: id!,
    surveyData: assignmentData?.assignment.survey?.json_data,
    existingResponse: assignmentData?.existingResponse,
    campaignInstanceId: assignmentData?.assignment.campaign_id || null,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!assignmentData?.assignment) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Survey not found or you don't have access to it.</p>
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/my-surveys")}
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
            onClick={() => navigate("/admin/my-surveys")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {assignmentData.assignment.campaign?.name || assignmentData.assignment.survey.name}
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

      <SubmitDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        onSubmit={handleSubmitSurvey}
      />
    </div>
  );
}
