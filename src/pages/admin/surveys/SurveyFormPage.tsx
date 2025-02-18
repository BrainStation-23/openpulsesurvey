
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Survey } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SurveyBuilder } from "./components/SurveyBuilder";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SurveyFormPage() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);

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
      
      // Set initial form values
      setName(data.name);
      setDescription(data.description || "");
      setTags(data.tags || []);
      
      return data as Survey;
    },
    enabled: isEditMode,
  });

  const handleSurveySubmit = async ({ jsonData, themeSettings }: { jsonData: any; themeSettings: any }) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      if (!session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to create a survey",
        });
        navigate('/login');
        return;
      }

      const surveyData = {
        name,
        description,
        tags,
        json_data: jsonData,
        theme_settings: themeSettings,
        status: "draft" as const,
      };

      if (isEditMode) {
        const { error } = await supabase
          .from('surveys')
          .update(surveyData)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Survey updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("surveys")
          .insert({
            ...surveyData,
            created_by: session.user.id,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Survey created successfully",
        });
      }
      
      navigate("/admin/surveys");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} survey`,
      });
    }
  };

  if (isEditMode && isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-6">
        <Card className="animate-pulse">
          <CardContent className="h-[600px]" />
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit' : 'Create New'} Survey</CardTitle>
          <CardDescription>
            {isEditMode ? 'Modify' : 'Create'} a survey using our intuitive builder or import from Survey.js
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Basic Info Section */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Survey Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter survey name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter survey description"
                    className="h-20"
                  />
                </div>
              </div>
              
              {/* Tags section - placeholder for now */}
              <div>
                <Label>Tags</Label>
                <div className="border rounded-md p-4 h-[120px] bg-muted/50">
                  Tag functionality will be implemented later
                </div>
              </div>
            </div>

            {/* Survey Builder Section */}
            <SurveyBuilder 
              onSubmit={handleSurveySubmit} 
              defaultValue={survey ? JSON.stringify(survey.json_data, null, 2) : undefined}
              defaultTheme={survey?.theme_settings}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
