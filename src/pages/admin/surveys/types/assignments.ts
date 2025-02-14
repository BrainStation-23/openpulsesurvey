
import { Database } from "@/integrations/supabase/types";

export type ResponseStatus = "assigned" | "in_progress" | "submitted" | "expired";

export type Survey = {
  id: string;
  name: string;
  description: string | null;
  json_data: Record<string, any>;
};

export type Campaign = {
  id: string;
  name: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type SurveyAssignment = {
  id: string;
  survey_id: string;
  campaign_id: string | null;
  user_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  status?: ResponseStatus;
};

export type Assignment = {
  id: string;
  status: ResponseStatus;
  public_access_token: string;
  last_reminder_sent?: string | null;
  campaign_id: string | null;
  survey_id: string;
  campaign?: Campaign;
  survey?: Survey;
  user: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    user_sbus?: {
      sbu: {
        id: string;
        name: string;
      };
      is_primary: boolean;
    }[];
  };
};
