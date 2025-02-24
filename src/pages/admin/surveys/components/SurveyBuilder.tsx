
import { useEffect, useState, useMemo } from "react";
import { Model, Serializer } from "survey-core";
import { Survey } from "survey-react-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { ThemeSwitcher } from "@/components/shared/surveys/ThemeSwitcher";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import "survey-core/defaultV2.min.css";
import * as themes from "survey-core/themes";

interface ValidationError {
  type: 'syntax' | 'schema' | 'question';
  message: string;
  location?: string;
}

interface ValidationState {
  isValid: boolean;
  errors: ValidationError[];
}

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
  const [survey, setSurvey] = useState<Model | null>(null);
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: false,
    errors: []
  });
  const [isDirty, setIsDirty] = useState(false);
  
  const initialTheme = useMemo(() => ({
    baseTheme: defaultTheme?.baseTheme || 'Layered',
    isDark: defaultTheme?.isDark ?? true,
    isPanelless: defaultTheme?.isPanelless ?? true
  }), [defaultTheme]);
  
  const [currentTheme, setCurrentTheme] = useState(initialTheme);

  const validateSurveyJson = (): ValidationState => {
    const errors: ValidationError[] = [];
    let parsedJson: any;

    // Step 1: Syntax validation
    try {
      parsedJson = JSON.parse(jsonContent);
    } catch (err: any) {
      return {
        isValid: false,
        errors: [{
          type: 'syntax' as const,
          message: `JSON Syntax Error: ${err.message}`
        }]
      };
    }

    // Step 2: Schema validation
    try {
      // Check if the JSON has basic survey structure
      if (!parsedJson.pages && !parsedJson.elements) {
        errors.push({
          type: 'schema' as const,
          message: 'Invalid survey schema: Missing pages or elements'
        });
      }

      // Validate each question's properties using Serializer
      const questions = parsedJson.pages 
        ? parsedJson.pages.flatMap((page: any) => page.elements || [])
        : parsedJson.elements || [];

      questions.forEach((question: any, index: number) => {
        if (!question.type) {
          errors.push({
            type: 'schema' as const,
            message: `Question ${index + 1} is missing required 'type' property`
          });
        } else {
          const questionMetadata = Serializer.findClass(question.type);
          if (!questionMetadata) {
            errors.push({
              type: 'schema' as const,
              message: `Question ${index + 1} has invalid type: ${question.type}`
            });
          }
        }
      });
    } catch (err: any) {
      errors.push({
        type: 'schema' as const,
        message: `Schema Error: ${err.message}`
      });
    }

    // Step 3: Question validation
    if (errors.length === 0) {
      try {
        const surveyModel = new Model(parsedJson);
        surveyModel.checkForErrors(); // Using the correct method to check for errors
        const questionErrors = surveyModel.errors || []; // Access errors through the errors property
        
        if (questionErrors.length > 0) {
          questionErrors.forEach(error => {
            errors.push({
              type: 'question' as const,
              message: error.text || 'Unknown error', // Use error.text for the message
              location: error.page?.name
            });
          });
        }
      } catch (err: any) {
        errors.push({
          type: 'question' as const,
          message: `Question Configuration Error: ${err.message}`
        });
      }
    }

    const isValid = errors.length === 0;
    
    if (isValid) {
      try {
        const surveyModel = new Model(parsedJson);
        const theme = getThemeInstance(currentTheme);
        if (theme) {
          surveyModel.applyTheme(theme);
        }
        setSurvey(surveyModel);
      } catch (err) {
        console.error("Error creating survey model:", err);
      }
    }

    return {
      isValid,
      errors
    };
  };

  const getThemeInstance = (themeSettings: typeof currentTheme) => {
    const themeName = `${themeSettings.baseTheme}${themeSettings.isDark ? 'Dark' : 'Light'}${themeSettings.isPanelless ? 'Panelless' : ''}`;
    return (themes as any)[themeName];
  };

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonContent(e.target.value);
    setIsDirty(true);
    setValidationState(prev => ({
      ...prev,
      isValid: false
    }));
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      setJsonContent(JSON.stringify(parsed, null, 2));
    } catch (err: any) {
      // Ignore formatting if JSON is invalid
    }
  };

  const handleValidate = () => {
    const result = validateSurveyJson();
    setValidationState(result);
    setIsDirty(false);
  };

  const handleSave = () => {
    if (!validationState.isValid || isDirty) {
      return;
    }

    try {
      const parsedJson = JSON.parse(jsonContent);
      onSubmit({
        jsonData: parsedJson,
        themeSettings: currentTheme
      });
    } catch (err: any) {
      console.error("Error saving survey:", err);
    }
  };

  const handleThemeChange = ({ theme, themeSettings }: { theme: any; themeSettings: any }) => {
    setCurrentTheme(themeSettings);
  };

  // Apply theme when it changes
  useEffect(() => {
    if (!survey) return;
    const theme = getThemeInstance(currentTheme);
    if (theme) {
      survey.applyTheme(theme);
    }
  }, [currentTheme, survey]);

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
            disabled={!validationState.isValid}
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
          defaultBaseTheme={initialTheme.baseTheme}
          defaultIsDark={initialTheme.isDark}
          defaultIsPanelless={initialTheme.isPanelless}
        />
      </div>

      {validationState.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc pl-4">
              {validationState.errors.map((error, index) => (
                <li key={index}>
                  {error.type === 'question' && error.location 
                    ? `[${error.location}] ${error.message}`
                    : error.message
                  }
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validationState.isValid && !isDirty && (
        <Alert className="bg-green-50 dark:bg-green-900/10">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-600 dark:text-green-400">
            Survey configuration is valid
          </AlertDescription>
        </Alert>
      )}

      <div className={cn("min-h-[500px]", isPreviewMode ? "hidden" : "block")}>
        <div className="flex flex-col gap-4">
          <Textarea
            value={jsonContent}
            onChange={handleEditorChange}
            className="min-h-[500px] font-mono text-sm"
            placeholder="Paste your survey JSON here..."
          />
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              onClick={formatJson}
              className="w-fit"
            >
              Format JSON
            </Button>
            <Button 
              variant="secondary"
              onClick={handleValidate}
              className="w-fit"
            >
              Validate JSON
            </Button>
          </div>
        </div>
      </div>

      <div className={cn("min-h-[500px]", !isPreviewMode ? "hidden" : "block")}>
        {survey && validationState.isValid && <Survey model={survey} />}
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={!validationState.isValid || isDirty}
        >
          {isDirty ? "Validate Before Saving" : "Save Survey"}
        </Button>
      </div>
    </div>
  );
}
