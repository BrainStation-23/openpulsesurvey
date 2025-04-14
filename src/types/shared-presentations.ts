
export interface SharedPresentation {
  id: string;
  campaign_id: string;
  instance_id: string | null;
  access_token: string;
  created_at: string;
  expires_at: string | null;
  created_by: string;
  is_active: boolean;
}
