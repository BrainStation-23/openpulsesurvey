
import { Json } from "@/integrations/supabase/types";
import { ResponseStatus } from "@/pages/admin/surveys/types/assignments";
import { Model } from "survey-core";

export interface ThemeSettings {
  [key: string]: Json | undefined;
  baseTheme: string;
  isDark: boolean;
  isPanelless: boolean;
}

export interface UseSurveyResponseProps {
  id: string;
  viewType: 'user' | 'admin';
  surveyData: any;
  existingResponse: any;
  campaignInstanceId: string | null;
  initialTheme: ThemeSettings;
}

export interface SurveyResponse {
  assignment_id: string;
  user_id: string;
  response_data: any;
  status: ResponseStatus;
  campaign_instance_id: string | null;
  state_data?: any;
  submitted_at?: string;
  updated_at?: string;
}

export interface ThemeChangeEvent {
  theme: any;
  themeSettings: ThemeSettings;
}

export interface UseSurveyResponseResult {
  survey: Model | null;
  lastSaved: Date | null;
  showSubmitDialog: boolean;
  setShowSubmitDialog: (show: boolean) => void;
  handleSubmitSurvey: () => Promise<void>;
  handleThemeChange: (event: ThemeChangeEvent) => void;
}
