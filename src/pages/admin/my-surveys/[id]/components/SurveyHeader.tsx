
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SurveyHeaderProps {
  title: string;
  lastSaved: Date | null;
}

export function SurveyHeader({ title, lastSaved }: SurveyHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/my-surveys")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      {lastSaved && (
        <p className="text-sm text-muted-foreground">
          Last saved: {lastSaved.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
