
export type SurveyStatus = 'draft' | 'published' | 'archived';

export type Survey = {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  json_data: Record<string, any>;
  theme_settings: {
    baseTheme: string;
    isDark: boolean;
    isPanelless: boolean;
  } | null;
  status: SurveyStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type Campaign = {
  id: string;
  name: string;
  description: string | null;
  survey_id: string;
  starts_at: string;
  ends_at: string | null;
  is_recurring: boolean;
  recurring_frequency?: RecurringFrequency;
  instance_duration_days?: number;
  instance_end_time?: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  anonymous?: boolean;
  campaign_type?: string;
  survey?: {
    name: string;
  };
};

export type ResponseStatus = 'assigned' | 'in_progress' | 'submitted' | 'expired';

export type Assignment = {
  id: string;
  status: ResponseStatus;
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
