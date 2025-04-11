
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import TemplateForm from "@/components/email-templates/TemplateForm";

export default function EditEmailTemplatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [exists, setExists] = useState(false);

  useEffect(() => {
    if (id) {
      checkTemplate(id);
    }
  }, [id]);

  const checkTemplate = async (templateId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("email_templates")
        .select("id")
        .eq("id", templateId)
        .single();

      if (error) throw error;
      setExists(!!data);
    } catch (error: any) {
      console.error("Error checking template:", error);
      toast({
        variant: "destructive",
        title: "Template not found",
        description: "The requested template could not be found",
      });
      navigate("/admin/config/email/templates");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-6 text-center">Loading...</div>;
  }

  if (!exists) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Template Not Found</h1>
        <p className="mb-4">The requested template could not be found.</p>
        <Button onClick={() => navigate("/admin/config/email/templates")}>
          Back to Templates
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/config/email/templates")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Edit Email Template</h1>
      </div>
      
      <TemplateForm templateId={id} />
    </div>
  );
}
