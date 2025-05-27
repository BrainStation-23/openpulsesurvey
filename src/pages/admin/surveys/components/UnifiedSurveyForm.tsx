
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { SurveyBuilder } from "./SurveyBuilder";
import { BasicInfoForm, type BasicInfoFormData } from "./BasicInfoForm";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface UnifiedSurveyFormProps {
  defaultValues?: {
    basicInfo?: Partial<BasicInfoFormData>;
    jsonData?: string;
    themeSettings?: {
      baseTheme: string;
      isDark: boolean;
      isPanelless: boolean;
    };
  };
}

export function UnifiedSurveyForm({ defaultValues }: UnifiedSurveyFormProps) {
  const [basicInfo, setBasicInfo] = useState<BasicInfoFormData | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Initialize basic info with default values in edit mode
  useEffect(() => {
    if (isEditMode && defaultValues?.basicInfo) {
      const defaultBasicInfo: BasicInfoFormData = {
        name: defaultValues.basicInfo.name || "",
        description: defaultValues.basicInfo.description || "",
        tags: defaultValues.basicInfo.tags || [],
      };
      setBasicInfo(defaultBasicInfo);
    }
  }, [isEditMode, defaultValues?.basicInfo]);

  const handleBasicInfoChange = (data: BasicInfoFormData) => {
    setBasicInfo(data);
  };

  const handleSubmit = async ({ jsonData, themeSettings }: { jsonData: any; themeSettings: any }) => {
    if (!basicInfo) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in the basic information first",
      });
      return;
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      if (!session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to save a survey",
        });
        navigate('/login');
        return;
      }

      if (isEditMode) {
        // Update existing survey
        const { error } = await supabase
          .from("surveys")
          .update({
            name: basicInfo.name,
            description: basicInfo.description,
            tags: basicInfo.tags,
            json_data: jsonData,
            theme_settings: themeSettings,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Survey updated successfully",
        });
      } else {
        // Create new survey
        const { error } = await supabase.from("surveys").insert({
          name: basicInfo.name,
          description: basicInfo.description,
          tags: basicInfo.tags,
          json_data: jsonData,
          theme_settings: themeSettings,
          status: "draft",
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

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <BasicInfoForm 
              onFormChange={handleBasicInfoChange}
              defaultValues={defaultValues?.basicInfo}
              hideSubmitButton
            />
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <Card>
        <CardContent className="pt-6">
          <SurveyBuilder 
            onSubmit={handleSubmit}
            defaultValue={defaultValues?.jsonData}
            defaultTheme={defaultValues?.themeSettings}
            submitButtonText={isEditMode ? "Update Survey" : "Save Survey"}
          />
        </CardContent>
      </Card>
    </div>
  );
}
