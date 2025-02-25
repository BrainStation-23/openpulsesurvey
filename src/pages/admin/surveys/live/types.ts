
import { z } from "zod";
import { Json } from "@/integrations/supabase/types";
import type { Survey as BaseSurvey } from "@/pages/admin/surveys/types";

// Define the theme settings interface to match the survey schema
export interface ThemeSettings {
  baseTheme: string;
  isDark: boolean;
  isPanelless: boolean;
}

// Extend the base Survey type to ensure theme_settings is properly typed
export interface Survey extends Omit<BaseSurvey, 'theme_settings' | 'json_data'> {
  theme_settings: ThemeSettings | null;
  json_data: Record<string, any>;
}

export type SessionStatus = "initial" | "active" | "paused" | "ended";

export type QuestionStatus = "pending" | "active" | "completed";

export const createSessionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  survey_id: z.string().min(1, "Please select a survey")
});

export type CreateSessionSchema = z.infer<typeof createSessionSchema>;

export interface LiveSession {
  id: string;
  name: string;
  join_code: string;
  status: SessionStatus;
  description?: string;
  survey_id: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  survey?: Survey;
}

export interface QuestionData {
  title: string;
  type: string;
  [key: string]: unknown;
}

export interface LiveSessionQuestion {
  id: string;
  session_id: string;
  question_key: string;
  question_data: QuestionData;
  status: QuestionStatus;
  display_order: number;
  enabled_at?: string;
  disabled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LiveSessionParticipant {
  id: string;
  session_id: string;
  participant_id: string;
  display_name?: string;
  status: "connected" | "disconnected";
  joined_at: string;
  last_active_at: string;
}

export interface LiveSessionResponse {
  id: string;
  session_id: string;
  participant_id: string;
  question_key: string;
  response_data: Json;
  response_time: string;
  created_at: string;
}
