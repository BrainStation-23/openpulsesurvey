
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { ThemeSwitcher } from "@/components/shared/surveys/ThemeSwitcher";

interface SurveyContentProps {
  name: string;
  description?: string | null;
  survey: Model | null;
  onThemeChange: (theme: any) => void;
}

export function SurveyContent({ name, description, survey, onThemeChange }: SurveyContentProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{name}</h1>
        {description && (
          <p className="text-muted-foreground mb-8">{description}</p>
        )}
        <div className="flex justify-end mb-6">
          <ThemeSwitcher onThemeChange={onThemeChange} />
        </div>
        <div className="bg-card rounded-lg border p-6">
          {survey ? (
            <Survey model={survey} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Unable to load survey. Please try again later.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
