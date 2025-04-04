
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate, useParams } from 'react-router-dom';
import { SurveyBuilder } from '@/components/survey-builder/SurveyBuilder';
import { SurveyStructure } from '@/types/survey-builder';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { convertToSurveyJSFormat } from '@/components/survey-builder/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoForm, BasicInfoFormData } from './components/BasicInfoForm';
import { Survey } from './types';
import { useQuery } from '@tanstack/react-query';
import { SurveyBuilder as JSONSurveyBuilder } from "./components/SurveyBuilder";

const CreateSurveyPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { userId } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<string>("basic-info");
  const [surveyInfo, setSurveyInfo] = useState<BasicInfoFormData>({
    name: '',
    description: '',
    tags: []
  });
  const [surveyStructure, setSurveyStructure] = useState<SurveyStructure | null>(null);
  
  // Fetch existing survey data if in edit mode
  const { data: existingSurvey, isLoading } = useQuery({
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
    enabled: !!id,
  });
  
  // Initialize form with existing data when it loads
  React.useEffect(() => {
    if (existingSurvey) {
      setSurveyInfo({
        name: existingSurvey.name,
        description: existingSurvey.description || '',
        tags: existingSurvey.tags || []
      });
    }
  }, [existingSurvey]);

  const handleBasicInfoSave = (data: BasicInfoFormData) => {
    setSurveyInfo(data);
    setActiveTab("builder");
    toast.success("Basic information saved");
  };

  const handleSaveSurvey = async (survey: SurveyStructure) => {
    try {
      if (!userId) {
        toast.error('You must be logged in to create a survey');
        return;
      }

      // Save the survey structure for potential JSON editing
      setSurveyStructure(survey);
      
      // Convert our survey structure to SurveyJS JSON format
      const surveyJSData = convertToSurveyJSFormat(survey);
      
      const surveyData = {
        name: surveyInfo.name,
        description: surveyInfo.description || null,
        tags: surveyInfo.tags,
        json_data: surveyJSData,
        status: 'draft',
        created_by: userId,
        theme_settings: {
          baseTheme: 'Layered',
          isDark: true,
          isPanelless: true
        }
      };
      
      if (id) {
        // Update existing survey
        const { error } = await supabase
          .from('surveys')
          .update(surveyData)
          .eq('id', id);
          
        if (error) throw error;
        toast.success('Survey updated successfully');
      } else {
        // Insert new survey
        const { error } = await supabase
          .from('surveys')
          .insert(surveyData);
          
        if (error) throw error;
        toast.success('Survey created successfully');
      }
      
      navigate('/admin/surveys');
    } catch (error) {
      console.error('Error saving survey:', error);
      toast.error('Failed to save survey');
    }
  };

  const handleJsonSave = async (data: { jsonData: any; themeSettings: any }) => {
    try {
      if (!userId) {
        toast.error('You must be logged in to create a survey');
        return;
      }

      const surveyData = {
        name: surveyInfo.name,
        description: surveyInfo.description || null,
        tags: surveyInfo.tags,
        json_data: data.jsonData,
        status: 'draft',
        created_by: userId,
        theme_settings: data.themeSettings
      };
      
      if (id) {
        // Update existing survey
        const { error } = await supabase
          .from('surveys')
          .update(surveyData)
          .eq('id', id);
          
        if (error) throw error;
        toast.success('Survey updated successfully');
      } else {
        // Insert new survey
        const { error } = await supabase
          .from('surveys')
          .insert(surveyData);
          
        if (error) throw error;
        toast.success('Survey created successfully');
      }
      
      navigate('/admin/surveys');
    } catch (error) {
      console.error('Error saving survey from JSON:', error);
      toast.error('Failed to save survey');
    }
  };

  if (isLoading && id) {
    return <div className="flex items-center justify-center min-h-[400px]">
      <p>Loading survey data...</p>
    </div>;
  }

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
        <h1 className="text-3xl font-bold">{id ? 'Edit Survey' : 'Create Survey'}</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{id ? 'Edit Survey' : 'New Survey'}</CardTitle>
          <CardDescription>
            {id ? 'Modify your existing survey' : 'Create a new survey using our survey builder or JSON editor'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
              <TabsTrigger value="builder">Survey Builder</TabsTrigger>
              <TabsTrigger value="json-editor">JSON Editor</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic-info">
              <BasicInfoForm 
                onSubmit={handleBasicInfoSave} 
                defaultValues={surveyInfo}
              />
            </TabsContent>
            
            <TabsContent value="builder">
              {activeTab === "builder" && (
                <SurveyBuilder 
                  initialSurvey={surveyStructure || undefined}
                  onSave={handleSaveSurvey} 
                />
              )}
            </TabsContent>
            
            <TabsContent value="json-editor">
              {activeTab === "json-editor" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Edit your survey JSON directly. The JSON must conform to SurveyJS format.
                  </p>
                  <JSONSurveyBuilder 
                    onSubmit={handleJsonSave}
                    defaultValue={existingSurvey ? JSON.stringify(existingSurvey.json_data, null, 2) : undefined}
                    defaultTheme={existingSurvey?.theme_settings || undefined}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateSurveyPage;
