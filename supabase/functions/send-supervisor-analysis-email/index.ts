
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  campaignId: string;
  instanceId: string;
  supervisorIds: string[];
}

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

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const { campaignId, instanceId, supervisorIds }: EmailRequest = await req.json();

    console.log("Processing supervisor analysis email request:", { 
      campaignId, 
      instanceId, 
      supervisorCount: supervisorIds.length 
    });

    // Fetch campaign information
    const { data: campaign, error: campaignError } = await supabase
      .from("survey_campaigns")
      .select("title")
      .eq("id", campaignId)
      .single();

    if (campaignError) {
      throw new Error(`Failed to fetch campaign: ${campaignError.message}`);
    }

    // Fetch supervisor analysis data
    const { data: analysisData, error: analysisError } = await supabase
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

    // Fetch supervisor profiles
    const { data: supervisors, error: supervisorError } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name")
      .in("id", supervisorIds);

    if (supervisorError) {
      throw new Error(`Failed to fetch supervisor profiles: ${supervisorError.message}`);
    }

    // Create email map
    const analysisMap = new Map();
    analysisData?.forEach(analysis => {
      analysisMap.set(analysis.supervisor_id, analysis);
    });

    const emailPromises = supervisors?.map(async (supervisor) => {
      const analysis = analysisMap.get(supervisor.id);
      if (!analysis) {
        console.warn(`No analysis found for supervisor ${supervisor.id}`);
        return null;
      }

      const supervisorName = `${supervisor.first_name || ''} ${supervisor.last_name || ''}`.trim() || 'Supervisor';
      
      const emailHtml = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .content { padding: 20px; }
              .analysis { background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .stats { background-color: #e3f2fd; padding: 15px; border-radius: 6px; margin: 15px 0; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Team Analysis Report</h1>
              <h2>Campaign: ${campaign.title}</h2>
            </div>
            
            <div class="content">
              <p>Dear ${supervisorName},</p>
              
              <p>We have completed the analysis of your team's survey responses. Below is your personalized team analysis report:</p>
              
              <div class="stats">
                <h3>Team Overview</h3>
                <ul>
                  <li><strong>Team Size:</strong> ${analysis.team_size} members</li>
                  <li><strong>Response Rate:</strong> ${Math.round(analysis.response_rate)}%</li>
                  <li><strong>Analysis Generated:</strong> ${new Date(analysis.generated_at).toLocaleDateString()}</li>
                </ul>
              </div>
              
              <div class="analysis">
                <h3>Analysis Report</h3>
                <div>${analysis.analysis_content.replace(/\n/g, '<br>')}</div>
              </div>
              
              <p>This analysis is based on your team's survey responses and is designed to help you understand patterns, strengths, and areas for improvement within your team.</p>
              
              <p>If you have any questions about this analysis or would like to discuss the findings, please don't hesitate to reach out to the HR team.</p>
              
              <p>Best regards,<br>The Survey Analysis Team</p>
            </div>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </body>
        </html>
      `;

      return resend.emails.send({
        from: "Survey Analysis <onboarding@resend.dev>",
        to: [supervisor.email],
        subject: `Team Analysis Report - ${campaign.title}`,
        html: emailHtml,
      });
    }) || [];

    // Send all emails
    const emailResults = await Promise.allSettled(emailPromises.filter(p => p !== null));
    
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
