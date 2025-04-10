
import { Database } from "@/integrations/supabase/types";

export type ResponseStatus = "assigned" | "in_progress" | "submitted" | "expired";

export type SurveyAssignment = {
  id: string;
  survey_id: string;
  campaign_id: string;
  user_id: string;
  status: ResponseStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  public_access_token: string;
  last_reminder_sent: string | null;
  user: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    user_sbus?: {
      is_primary: boolean;
      sbu: {
        id: string;
        name: string;
      };
    }[];
  };
  response?: {
    status: ResponseStatus;
    campaign_instance_id: string;
  };
};

// This type maps to what StatusDistributionChart component expects
export type ResponseStatusChartData = {
  name: string;
  value: number;
};
