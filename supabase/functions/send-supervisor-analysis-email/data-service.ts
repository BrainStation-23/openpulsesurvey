
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { SupervisorAnalysis, SupervisorProfile, Campaign, EmailConfig } from "./types.ts";

export class DataService {
  private supabase: any;

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async getEmailConfig(): Promise<EmailConfig> {
    const { data: emailConfig, error: emailConfigError } = await this.supabase
      .from("email_config")
      .select("from_email, from_name")
      .eq("provider", "resend")
      .single();

    if (emailConfigError || !emailConfig) {
      throw new Error("Email configuration not found. Please configure email settings first.");
    }

    return emailConfig;
  }

  async getCampaign(campaignId: string): Promise<Campaign> {
    const { data: campaign, error: campaignError } = await this.supabase
      .from("survey_campaigns")
      .select("name")
      .eq("id", campaignId)
      .single();

    if (campaignError) {
      throw new Error(`Failed to fetch campaign: ${campaignError.message}`);
    }

    return campaign;
  }

  async getSupervisorAnalysis(
    campaignId: string,
    instanceId: string,
    supervisorIds: string[]
  ): Promise<SupervisorAnalysis[]> {
    const { data: analysisData, error: analysisError } = await this.supabase
      .from("ai_feedback_analysis")
      .select(`
        supervisor_id,
        analysis_content,
        team_size,
        response_rate,
        generated_at
      `)
      .eq("campaign_id", campaignId)
      .eq("instance_id", instanceId)
      .in("supervisor_id", supervisorIds);

    if (analysisError) {
      throw new Error(`Failed to fetch analysis data: ${analysisError.message}`);
    }

    return analysisData || [];
  }

  async getSupervisorProfiles(supervisorIds: string[]): Promise<SupervisorProfile[]> {
    const { data: supervisors, error: supervisorError } = await this.supabase
      .from("profiles")
      .select("id, email, first_name, last_name")
      .in("id", supervisorIds);

    if (supervisorError) {
      throw new Error(`Failed to fetch supervisor profiles: ${supervisorError.message}`);
    }

    return supervisors || [];
  }
}
