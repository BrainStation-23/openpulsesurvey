
import { Survey } from "@/types/survey";

export type SessionStatus = "initial" | "active" | "paused" | "ended";

export type QuestionStatus = "pending" | "active" | "completed";

export interface LiveSession {
  id: string;
  name: string;
  join_code: string;
  status: SessionStatus;
  description?: string;
  survey_id: string;
  created_by: string;
  created_at: string;
  survey?: Survey;  // Add the survey relationship
}
