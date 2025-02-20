
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SurveyAlertProps {
  title: string;
  description: React.ReactNode;
}

export function SurveyAlert({ title, description }: SurveyAlertProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
