
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Survey as SurveyComponent } from "survey-react-ui";
import { Model } from "survey-core";
import { LayeredDarkPanelless } from "survey-core/themes";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Survey } from "../types";
import "survey-core/defaultV2.min.css";

export default function PreviewSurveyPage() {
  const { id } = useParams();

  const { data: survey, isLoading } = useQuery({
    queryKey: ['surveys', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Survey;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!survey) {
    return <div>Survey not found</div>;
  }

  const surveyModel = new Model(survey.json_data);
  surveyModel.applyTheme(LayeredDarkPanelless);

  // Sanitize HTML content to prevent XSS
  const createSafeHTML = (htmlContent: string) => {
    // Remove script tags and event handlers
    const sanitized = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/\son\w+="[^"]*"/g, '')
      .replace(/\son\w+='[^']*'/g, '')
      .replace(/javascript:/gi, '');
    
    return { __html: sanitized };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/admin/surveys">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{survey.name}</h1>
          {survey.description && (
            <p className="text-muted-foreground">{survey.description}</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div 
          className="survey-container"
          dangerouslySetInnerHTML={createSafeHTML(`
            <div id="surveyElement"></div>
            <script>
              // Prevent any script execution in preview mode
              console.log('Survey preview mode - scripts disabled');
            </script>
          `)}
        />
        <SurveyComponent model={surveyModel} />
      </div>
    </div>
  );
}
