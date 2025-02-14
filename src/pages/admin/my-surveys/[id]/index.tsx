
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

  const { data: assignment, isLoading } = useQuery({
    queryKey: ["survey-assignment", id],
    queryFn: async () => {
      const { data, error } = await supabase
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
          campaign:survey_campaigns (
            id,
            name
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Survey assignment not found");
      return data;
    },
  });

  const {
    survey,
    lastSaved,
    showSubmitDialog,
    setShowSubmitDialog,
    handleSubmitSurvey
  } = useSurveyResponse({
    id: id!,
    surveyData: assignment?.survey?.json_data,
    existingResponse: null,
    campaignInstanceId: null,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!assignment) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Survey not found or you don't have access to it.</p>
        <Button
          variant="ghost"
          onClick={() => navigate("/user/my-surveys")}
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
            onClick={() => navigate("/user/my-surveys")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {assignment.campaign?.name || assignment.survey.name}
          </h1>
        </div>
        {lastSaved && (
          <p className="text-sm text-muted-foreground">
            Last saved: {lastSaved.toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <ThemeSwitcher onThemeChange={() => {}} />
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
