
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TemplateForm } from "@/components/email-templates/TemplateForm";

export default function CreateTemplatePage() {
  const navigate = useNavigate();

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
        <h1 className="text-2xl font-bold">Create Email Template</h1>
      </div>

      <TemplateForm
        template={null}
        onCancel={() => navigate("/admin/config/email/templates")}
        onSuccess={(savedId) => navigate(`/admin/config/email/templates/${savedId}`)}
      />
    </div>
  );
}
