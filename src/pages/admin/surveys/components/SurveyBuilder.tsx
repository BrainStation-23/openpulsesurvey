
import { useEffect, useState } from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { ThemeSwitcher } from "@/components/shared/surveys/ThemeSwitcher";
import "survey-core/defaultV2.min.css";

interface SurveyBuilderProps {
  onSubmit: (data: { jsonData: any; themeSettings: any }) => void;
  defaultValue?: string;
  defaultTheme?: {
    baseTheme: string;
    isDark: boolean;
    isPanelless: boolean;
  };
}

export function SurveyBuilder({ onSubmit, defaultValue, defaultTheme }: SurveyBuilderProps) {
  const [jsonContent, setJsonContent] = useState(defaultValue || "{}");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [survey, setSurvey] = useState<Model | null>(null);
  const [currentTheme, setCurrentTheme] = useState(defaultTheme || {
    baseTheme: 'Layered',
    isDark: true,
    isPanelless: true
  });

  // Create or update survey model when JSON content changes
  useEffect(() => {
    try {
      const parsedJson = JSON.parse(jsonContent);
      const surveyModel = new Model(parsedJson);
      
      // Get theme name based on current theme settings
      const themeName = `${currentTheme.baseTheme}${currentTheme.isDark ? 'Dark' : 'Light'}${currentTheme.isPanelless ? 'Panelless' : ''}`;
      const themeMap = require('survey-core/themes');
      const theme = themeMap[themeName];
      
      if (theme) {
        console.log("Applying theme on survey creation:", themeName);
        surveyModel.applyTheme(theme);
      }
      
      setSurvey(surveyModel);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setSurvey(null);
    }
  }, [jsonContent, currentTheme]);

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonContent(e.target.value);
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      setJsonContent(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSave = () => {
    try {
      const parsedJson = JSON.parse(jsonContent);
      onSubmit({
        jsonData: parsedJson,
        themeSettings: currentTheme
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleThemeChange = ({ theme, themeSettings }: { theme: any; themeSettings: any }) => {
    console.log("Theme change received:", themeSettings);
    if (survey) {
      survey.applyTheme(theme);
      setCurrentTheme(themeSettings);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Survey Builder</h3>
          <p className="text-sm text-muted-foreground">
            Design your survey using the JSON editor below
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            {isPreviewMode ? "Edit" : "Preview"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              window.open("https://surveyjs.io/create-survey", "_blank");
            }}
          >
            Open Survey.js Creator
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <ThemeSwitcher 
          onThemeChange={handleThemeChange}
          defaultBaseTheme={currentTheme.baseTheme}
          defaultIsDark={currentTheme.isDark}
          defaultIsPanelless={currentTheme.isPanelless}
        />
      </div>

      <div className={cn("min-h-[500px]", isPreviewMode ? "hidden" : "block")}>
        <div className="flex flex-col gap-4">
          <Textarea
            value={jsonContent}
            onChange={handleEditorChange}
            className="min-h-[500px] font-mono text-sm"
            placeholder="Paste your survey JSON here..."
          />
          <Button 
            variant="secondary" 
            onClick={formatJson}
            className="w-fit"
          >
            Format JSON
          </Button>
        </div>
      </div>

      <div className={cn("min-h-[500px]", !isPreviewMode ? "hidden" : "block")}>
        {survey && <Survey model={survey} />}
      </div>

      {error && (
        <p className="text-sm text-destructive">
          Invalid JSON format: {error}
        </p>
      )}

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!!error}>
          Save Survey
        </Button>
      </div>
    </div>
  );
}
