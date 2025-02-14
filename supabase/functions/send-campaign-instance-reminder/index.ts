import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CampaignInstanceReminderRequest {
  assignmentIds: string[];
  instanceId: string;
  campaignId: string;
  baseUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting campaign instance reminder process...");
    
    // Validate environment variables
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Supabase credentials are not set");
      throw new Error("Supabase credentials are not configured");
    }

    const reminderRequest: CampaignInstanceReminderRequest = await req.json();
    console.log("Reminder request:", JSON.stringify(reminderRequest));

    if (!reminderRequest.assignmentIds?.length) {
      throw new Error("No assignment IDs provided");
    }

    if (!reminderRequest.baseUrl) {
      throw new Error("Base URL is required");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get the email configuration
    const { data: emailConfig, error: configError } = await supabase
      .from('email_config')
      .select('*')
      .maybeSingle();

    if (configError) {
      console.error("Error fetching email config:", configError);
      throw new Error("Failed to fetch email configuration");
    }

    if (!emailConfig) {
      throw new Error("No email configuration found");
    }

    // Get campaign instance data
    const { data: instance, error: instanceError } = await supabase
      .from('campaign_instances')
      .select('*')
      .eq('id', reminderRequest.instanceId)
      .single();

    if (instanceError) {
      console.error("Error fetching instance:", instanceError);
      throw new Error("Failed to fetch instance data");
    }

    // Get campaign data
    const { data: campaign, error: campaignError } = await supabase
      .from('survey_campaigns')
      .select(`
        *,
        survey:surveys (
          id,
          name,
          description
        )
      `)
      .eq('id', reminderRequest.campaignId)
      .single();

    if (campaignError) {
      console.error("Error fetching campaign:", campaignError);
      throw new Error("Failed to fetch campaign data");
    }

    // Process assignments using the RPC function
    const { data: assignments, error: assignmentsError } = await supabase
      .rpc('get_campaign_assignments', {
        p_campaign_id: reminderRequest.campaignId,
        p_instance_id: reminderRequest.instanceId
      });

    if (assignmentsError) {
      console.error("Error fetching assignments:", assignmentsError);
      throw new Error("Failed to fetch assignments data");
    }

    // Filter assignments to only those requested
    const filteredAssignments = assignments.filter(
      (assignment: any) => reminderRequest.assignmentIds.includes(assignment.id)
    );

    // Format deadline date and time
    const deadline = new Date(instance.ends_at);
    const formattedDeadline = deadline.toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

    // Process each assignment
    const results = await Promise.all(
      filteredAssignments.map(async (assignment: any) => {
        try {
          // Calculate time remaining
          const now = new Date();
          const hoursRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
          const daysRemaining = Math.ceil(hoursRemaining / 24);
          
          let urgencyMessage = "";
          if (daysRemaining <= 1) {
            urgencyMessage = `⚠️ This survey must be completed within the next ${hoursRemaining} hours.`;
          } else {
            urgencyMessage = `You have ${daysRemaining} days to complete this survey.`;
          }

          // Generate the public access URL using the provided base URL
          const publicAccessUrl = `${reminderRequest.baseUrl}/public/survey/${assignment.public_access_token}`;

          const userDetails = assignment.user_details;
          const recipientName = `${userDetails.first_name || ''} ${userDetails.last_name || ''}`.trim() || 'User';

          // Send reminder email using Resend
          console.log("Sending email via Resend...");
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: `${emailConfig.from_name} <${emailConfig.from_email}>`,
              to: [userDetails.email],
              subject: `Reminder: ${campaign.survey.name} - Due ${formattedDeadline}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Hello ${recipientName},</h2>
                  <p>This is a reminder about your pending survey: <strong>${campaign.survey.name}</strong></p>
                  <div style="background-color: #f8f9fa; border-left: 4px solid #2563eb; padding: 1rem; margin: 1rem 0;">
                    <p style="margin: 0; color: #1e40af;"><strong>DEADLINE: ${formattedDeadline}</strong></p>
                    <p style="margin-top: 0.5rem; color: #4b5563;">${urgencyMessage}</p>
                  </div>
                  ${campaign.survey.description ? `<p>${campaign.survey.description}</p>` : ''}
                  <p>Please complete the survey by clicking the link below:</p>
                  <p><a href="${publicAccessUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Survey</a></p>
                  <p style="color: #666; font-size: 14px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
                  <p style="color: #666; font-size: 14px;">${publicAccessUrl}</p>
                  <p>Thank you for your participation!</p>
                </div>
              `,
            }),
          });

          if (!res.ok) {
            const resendError = await res.json();
            throw new Error(`Resend API error: ${JSON.stringify(resendError)}`);
          }

          // Update last_reminder_sent timestamp
          const { error: updateError } = await supabase
            .from('survey_assignments')
            .update({ last_reminder_sent: new Date().toISOString() })
            .eq('id', assignment.id);

          if (updateError) {
            console.error("Error updating last_reminder_sent:", updateError);
            throw updateError;
          }

          return {
            assignmentId: assignment.id,
            status: 'success',
            message: 'Reminder sent successfully'
          };

        } catch (error: any) {
          console.error(`Error processing assignment ${assignment.id}:`, error);
          return {
            assignmentId: assignment.id,
            status: 'error',
            message: error.message
          };
        }
      })
    );

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    return new Response(
      JSON.stringify({ 
        message: `Processed ${results.length} assignments: ${successCount} successful, ${errorCount} failed`,
        results 
      }),
      { 
        status: errorCount > 0 ? 500 : 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("Error in send-campaign-instance-reminder function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send campaign instance reminders",
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};

serve(handler);
