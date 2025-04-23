
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Survey } from "./types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UnifiedSurveyForm } from "./components/UnifiedSurveyForm";

export default function SurveyFormPage() {
  const { id } = useParams();
  const isEditMode = !!id;
  
  const { data: survey, isLoading } = useQuery({
    queryKey: ['survey', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Survey;
    },
    enabled: isEditMode,
  });

  if (isEditMode && isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-6">
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit' : 'Create New'} Survey</CardTitle>
          <CardDescription>
            {isEditMode ? 'Modify' : 'Create'} a survey using our intuitive builder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UnifiedSurveyForm 
            defaultValues={
              survey 
                ? {
                    basicInfo: {
                      name: survey.name,
                      description: survey.description || "",
                      tags: survey.tags || [],
                    },
                    jsonData: JSON.stringify(survey.json_data, null, 2),
                    themeSettings: survey.theme_settings,
                  }
                : undefined
            } 
          />
        </CardContent>
      </Card>
    </div>
  );
}
