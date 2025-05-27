
export interface EmailRequest {
  campaignId: string;
  instanceId: string;
  supervisorIds: string[];
}

export interface SupervisorAnalysis {
  supervisor_id: string;
  analysis_content: string;
  team_size: number;
  response_rate: number;
  generated_at: string;
}

export interface SupervisorProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

export interface Campaign {
  name: string;
}

export interface EmailConfig {
  from_email: string;
  from_name: string;
}
