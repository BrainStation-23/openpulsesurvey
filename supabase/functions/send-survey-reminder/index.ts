
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

interface ReminderRequest {
  instanceId: string;
  campaignId: string;
  frontendUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting reminder process...");
    
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials are not configured");
    }

    const { instanceId, campaignId, frontendUrl }: ReminderRequest = await req.json();
    console.log("Reminder request:", { instanceId, campaignId, frontendUrl });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get the email configuration
    const { data: emailConfig, error: configError } = await supabase
      .from('email_config')
      .select('*')
      .maybeSingle();

    if (configError) {
      throw new Error("Failed to fetch email configuration");
    }

    if (!emailConfig) {
      throw new Error("No email configuration found");
    }

    // Get instance details
    const { data: instance, error: instanceError } = await supabase
      .from('campaign_instances')
      .select('*')
      .eq('id', instanceId)
      .single();

    if (instanceError || !instance) {
      throw new Error("Failed to fetch instance details");
    }

    // Get pending assignments with user and survey details
    const { data: assignments, error: assignmentsError } = await supabase
      .from('survey_assignments')
      .select(`
        id,
        public_access_token,
        last_reminder_sent,
        user:profiles!survey_assignments_user_id_fkey (
          email,
          first_name,
          last_name
        ),
        survey:surveys (
          name
        )
      `)
      .eq('campaign_id', campaignId)
      .not(
        'id',
        'in',
        supabase
          .from('survey_responses')
          .select('assignment_id')
          .eq('campaign_instance_id', instanceId)
          .eq('status', 'submitted')
          .then(response => response.data?.map(r => r.assignment_id) || [])
      );

    if (assignmentsError) {
      throw new Error("Failed to fetch assignments");
    }

    if (!assignments?.length) {
      return new Response(
        JSON.stringify({ 
          message: "No pending assignments found",
          successCount: 0,
          failureCount: 0,
          skippedCount: 0
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;

    // Send reminders to pending users
    const results = await Promise.allSettled(
      assignments.map(async (assignment) => {
        try {
          // Check cooldown period
          if (assignment.last_reminder_sent) {
            const lastSent = new Date(assignment.last_reminder_sent);
            const hoursSinceLastReminder = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
            
            if (hoursSinceLastReminder < 24) {
              skippedCount++;
              return;
            }
          }

          const recipientName = `${assignment.user.first_name || ''} ${assignment.user.last_name || ''}`.trim() || 'Participant';
          const publicAccessUrl = `${frontendUrl}/public/survey/${assignment.public_access_token}`;

          // Format deadline date and time
          const deadline = new Date(instance.ends_at);
          const formattedDeadline = deadline.toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short'
          });

          // Calculate time remaining
          const now = new Date();
          const hoursRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
          const daysRemaining = Math.ceil(hoursRemaining / 24);
          
          const urgencyMessage = daysRemaining <= 1
            ? `⚠️ This survey must be completed within the next ${hoursRemaining} hours.`
            : `You have ${daysRemaining} days to complete this survey.`;

          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: `${emailConfig.from_name} <${emailConfig.from_email}>`,
              to: [assignment.user.email],
              subject: `Deadline Reminder: ${assignment.survey.name} Due ${formattedDeadline}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Hello ${recipientName},</h2>
                  <p>This is a reminder about your pending survey: <strong>${assignment.survey.name}</strong></p>
                  <div style="background-color: #f8f9fa; border-left: 4px solid #2563eb; padding: 1rem; margin: 1rem 0;">
                    <p style="margin: 0; color: #1e40af;"><strong>DEADLINE: ${formattedDeadline}</strong></p>
                    <p style="margin-top: 0.5rem; color: #4b5563;">${urgencyMessage}</p>
                  </div>
                  <p>Please complete the survey by clicking the link below:</p>
                  <p><a href="${publicAccessUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Complete Survey</a></p>
                  <p style="color: #666; font-size: 14px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
                  <p style="color: #666; font-size: 14px;">${publicAccessUrl}</p>
                  <p>Thank you for your participation!</p>
                </div>
              `,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to send email to ${assignment.user.email}`);
          }

          // Update last_reminder_sent timestamp
          await supabase
            .from('survey_assignments')
            .update({ last_reminder_sent: new Date().toISOString() })
            .eq('id', assignment.id);

          successCount++;
        } catch (error) {
          console.error(`Error processing assignment ${assignment.id}:`, error);
          failureCount++;
        }
      })
    );

    return new Response(
      JSON.stringify({ 
        message: `Processed ${assignments.length} assignments`,
        successCount,
        failureCount,
        skippedCount,
      }),
      { 
        status: failureCount > 0 ? 500 : 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("Error in send-survey-reminder function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send email reminder",
        details: error.message,
        successCount: 0,
        failureCount: 1,
        skippedCount: 0
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};

serve(handler);
