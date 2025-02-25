
import { z } from "zod";
import { Json } from "@/integrations/supabase/types";

// Import Survey type from the correct location
import type { Survey } from "@/pages/admin/surveys/types";

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
