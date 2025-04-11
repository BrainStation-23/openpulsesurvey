
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TemplateForm } from "@/components/email-templates/TemplateForm";
import { EmailTemplate } from "@/types/email-templates";

export default function EditTemplatePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNewTemplate = id === "new";

  const { data: template, isLoading } = useQuery({
    queryKey: ["email-template", id],
    queryFn: async () => {
      if (isNewTemplate) return null;
      
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as EmailTemplate;
    },
    enabled: !isNewTemplate,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/config/email/templates")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isNewTemplate ? "Create Email Template" : "Edit Email Template"}
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <TemplateForm
          template={template}
          onCancel={() => navigate("/admin/config/email/templates")}
          onSuccess={(savedId) =>
            navigate(`/admin/config/email/templates/${savedId}`, {
              replace: true,
            })
          }
        />
      )}
    </div>
  );
}
