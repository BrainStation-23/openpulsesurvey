
import { z } from "zod";
import { Json } from "@/integrations/supabase/types";

export type SessionStatus = "initial" | "active" | "paused" | "ended";

export type QuestionStatus = "pending" | "active" | "completed";

export const createSessionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  survey_id: z.string().min(1, "Please select a survey")
});

export type CreateSessionSchema = z.infer<typeof createSessionSchema>;

export type LiveSession = {
  id: string;
  name: string;
  join_code: string;
  status: SessionStatus;
  created_at: string;
  description?: string;
  survey_id: string;
  created_by: string;
};

export interface QuestionData {
  title: string;
  type: string;
  [key: string]: unknown;
}

export type LiveSessionQuestion = {
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
};

export type LiveSessionParticipant = {
  id: string;
  session_id: string;
  participant_id: string;
  display_name?: string;
  status: "connected" | "disconnected";
  joined_at: string;
  last_active_at: string;
};

export type LiveSessionResponse = {
  id: string;
  session_id: string;
  participant_id: string;
  question_key: string;
  response_data: any; // Type depends on question type
  response_time: string;
  created_at: string;
};
