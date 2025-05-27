
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { EmailRequest } from "./types.ts";
import { DataService } from "./data-service.ts";
import { EmailService } from "./email-service.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { campaignId, instanceId, supervisorIds }: EmailRequest = await req.json();

    console.log("Processing supervisor analysis email request:", { 
      campaignId, 
      instanceId, 
      supervisorCount: supervisorIds.length 
    });

    // Initialize services
    const dataService = new DataService(supabaseUrl, supabaseServiceKey);
    const emailService = new EmailService(resendApiKey);

    // Fetch all required data
    const [emailConfig, campaign, analysisData, supervisors] = await Promise.all([
      dataService.getEmailConfig(),
      dataService.getCampaign(campaignId),
      dataService.getSupervisorAnalysis(campaignId, instanceId, supervisorIds),
      dataService.getSupervisorProfiles(supervisorIds)
    ]);

    // Create email map
    const analysisMap = new Map();
    analysisData.forEach(analysis => {
      analysisMap.set(analysis.supervisor_id, analysis);
    });

    const emailPromises = supervisors.map(async (supervisor) => {
      const analysis = analysisMap.get(supervisor.id);
      if (!analysis) {
        console.warn(`No analysis found for supervisor ${supervisor.id}`);
        return null;
      }

      return emailService.sendAnalysisEmail(supervisor, analysis, campaign, emailConfig);
    }).filter(p => p !== null);

    // Send all emails
    const emailResults = await Promise.allSettled(emailPromises);
    
    const successCount = emailResults.filter(result => result.status === 'fulfilled').length;
    const failureCount = emailResults.filter(result => result.status === 'rejected').length;

    console.log(`Email sending completed: ${successCount} successful, ${failureCount} failed`);

    // Log any failures
    emailResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to send email to supervisor ${supervisorIds[index]}:`, result.reason);
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully sent ${successCount} emails`,
        successCount,
        failureCount
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-supervisor-analysis-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Unknown error occurred" 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
