
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { SurveyBuilder } from '@/components/survey-builder/SurveyBuilder';
import { SurveyStructure } from '@/types/survey-builder';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { convertToSurveyJSFormat } from '@/components/survey-builder/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const CreateSurveyPage = () => {
  const navigate = useNavigate();
  const { userId } = useCurrentUser();

  const handleSaveSurvey = async (survey: SurveyStructure) => {
    try {
      if (!userId) {
        toast.error('You must be logged in to create a survey');
        return;
      }

      // Convert our survey structure to SurveyJS JSON format
      const surveyJSData = convertToSurveyJSFormat(survey);
      
      // Insert the survey into the database
      const { data, error } = await supabase
        .from('surveys')
        .insert({
          name: survey.title,
          description: survey.description || null,
          json_data: surveyJSData,
          status: 'draft',
          created_by: userId, // Adding the required created_by field
          theme_settings: {
            baseTheme: 'Layered',
            isDark: true,
            isPanelless: true
          }
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Survey created successfully');
      navigate('/admin/surveys');
    } catch (error) {
      console.error('Error creating survey:', error);
      toast.error('Failed to create survey');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/admin/surveys')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Create Survey</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>New Survey</CardTitle>
          <CardDescription>
            Create a new survey using our custom survey builder
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <SurveyBuilder onSave={handleSaveSurvey} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateSurveyPage;
