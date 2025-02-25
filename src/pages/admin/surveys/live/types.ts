
import { z } from "zod";

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
  status: "initial" | "active" | "paused" | "ended";
  created_at: string;
  description?: string;
  survey_id: string;
  created_by: string;
};
