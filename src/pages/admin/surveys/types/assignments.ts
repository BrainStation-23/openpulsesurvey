
import { Database } from "@/integrations/supabase/types";

export type ResponseStatus = "assigned" | "in_progress" | "submitted" | "expired";

export type Survey = {
  id: string;
  name: string;
  description: string | null;
  json_data: Database["public"]["Tables"]["surveys"]["Row"]["json_data"];
};

export type Instance = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: Database["public"]["Enums"]["instance_status"];
};

export type Assignment = {
  id: string;
  survey_id: string;
  campaign_id: string | null;
  user_id: string;
  status: ResponseStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  public_access_token: string;
  last_reminder_sent: string | null;
  instance: Instance;
  survey: Survey;
  response?: {
    status: ResponseStatus;
    campaign_instance_id: string;
  };
};
