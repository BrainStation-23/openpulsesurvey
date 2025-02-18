
import { useEffect, useState, useMemo } from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { ThemeSwitcher } from "@/components/shared/surveys/ThemeSwitcher";
import "survey-core/defaultV2.min.css";
import * as themes from "survey-core/themes";

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
  const [error, setError] = useState<string | null>(null);
  const [survey, setSurvey] = useState<Model | null>(null);
  
  // Ensure theme settings are properly capitalized
  const initialTheme = useMemo(() => ({
    baseTheme: defaultTheme?.baseTheme || 'Layered',
    isDark: defaultTheme?.isDark ?? true,
    isPanelless: defaultTheme?.isPanelless ?? true
  }), [defaultTheme]);
  
  const [currentTheme, setCurrentTheme] = useState(initialTheme);

  // Function to get theme instance
  const getThemeInstance = (themeSettings: typeof currentTheme) => {
    const themeName = `${themeSettings.baseTheme}${themeSettings.isDark ? 'Dark' : 'Light'}${themeSettings.isPanelless ? 'Panelless' : ''}`;
    console.log("Getting theme instance for:", themeName);
    return (themes as any)[themeName];
  };

  // Create or update survey model when JSON content changes
  useEffect(() => {
    try {
      console.log("Creating new survey model with theme:", currentTheme);
      const parsedJson = JSON.parse(jsonContent);
      const surveyModel = new Model(parsedJson);
      
      // Apply theme immediately after model creation
      const theme = getThemeInstance(currentTheme);
      if (theme) {
        console.log("Applying initial theme:", theme);
        surveyModel.applyTheme(theme);
      }

      setSurvey(surveyModel);
      setError(null);
    } catch (err: any) {
      console.error("Error creating survey model:", err);
      setError(err.message);
      setSurvey(null);
    }
  }, [jsonContent]);

  // Handle theme changes
  useEffect(() => {
    if (!survey) return;

    console.log("Applying theme update:", currentTheme);
    const theme = getThemeInstance(currentTheme);
    if (theme) {
      survey.applyTheme(theme);
    }
  }, [currentTheme, survey]);

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
    setCurrentTheme(themeSettings);
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
      </div>

      <div className="grid grid-cols-2 gap-6 min-h-[600px]">
        {/* Left side - JSON Editor */}
        <div className="flex flex-col gap-4">
          <Textarea
            value={jsonContent}
            onChange={handleEditorChange}
            className="flex-1 font-mono text-sm min-h-[500px]"
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

        {/* Right side - Preview with controls */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-4 gap-4">
            <ThemeSwitcher 
              onThemeChange={handleThemeChange}
              defaultBaseTheme={initialTheme.baseTheme}
              defaultIsDark={initialTheme.isDark}
              defaultIsPanelless={initialTheme.isPanelless}
            />
            <Button
              variant="outline"
              onClick={() => {
                window.open("https://surveyjs.io/create-survey", "_blank");
              }}
            >
              Open Survey.js Creator
            </Button>
          </div>
          <div className="flex-1 border rounded-md p-4 bg-background">
            {survey && <Survey model={survey} />}
          </div>
        </div>
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
