
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import TemplateForm from "@/components/email-templates/TemplateForm";

export default function NewEmailTemplatePage() {
  const navigate = useNavigate();
  
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
        <h1 className="text-2xl font-bold">Create Email Template</h1>
      </div>
      
      <TemplateForm />
    </div>
  );
}
