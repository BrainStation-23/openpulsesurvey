
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
  assignmentIds: string[];
  instanceId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting reminder process...");
    
    // Validate environment variables
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Supabase credentials are not set");
      throw new Error("Supabase credentials are not configured");
    }

    const reminderRequest: ReminderRequest = await req.json();
    console.log("Reminder request:", JSON.stringify(reminderRequest));

    if (!reminderRequest.assignmentIds || !reminderRequest.assignmentIds.length) {
      throw new Error("No assignment IDs provided");
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

    // Process each assignment
    const results = await Promise.all(reminderRequest.assignmentIds.map(async (assignmentId) => {
      try {
        console.log(`Fetching assignment data for ID: ${assignmentId}`);
        
        // First, get the basic assignment data
        const { data: assignment, error: assignmentError } = await supabase
          .from('survey_assignments')
          .select(`
            id,
            last_reminder_sent,
            public_access_token,
            campaign_id,
            survey_id
          `)
          .eq('id', assignmentId)
          .single();

        if (assignmentError) {
          console.error("Error fetching basic assignment:", assignmentError);
          throw new Error(`Failed to fetch basic assignment data: ${assignmentError.message}`);
        }

        if (!assignment) {
          throw new Error(`Assignment not found for ID ${assignmentId}`);
        }

        // Get user data
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('email, first_name, last_name')
          .eq('id', assignment.user_id)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError);
          throw new Error(`Failed to fetch user data: ${userError.message}`);
        }

        // Get survey data
        const { data: surveyData, error: surveyError } = await supabase
          .from('surveys')
          .select('name')
          .eq('id', assignment.survey_id)
          .single();

        if (surveyError) {
          console.error("Error fetching survey:", surveyError);
          throw new Error(`Failed to fetch survey data: ${surveyError.message}`);
        }

        // Get active instance
        const { data: instances, error: instanceError } = await supabase
          .from('campaign_instances')
          .select('*')
          .eq('campaign_id', assignment.campaign_id)
          .eq('status', 'active')
          .order('period_number', { ascending: false })
          .limit(1);

        if (instanceError) {
          console.error("Error fetching instance:", instanceError);
          throw new Error(`Failed to fetch instance data: ${instanceError.message}`);
        }

        const activeInstance = instances?.[0];
        if (!activeInstance) {
          throw new Error("No active instance found for this campaign");
        }

        // Check if a reminder was sent in the last 24 hours
        if (assignment.last_reminder_sent) {
          const lastSent = new Date(assignment.last_reminder_sent);
          const hoursSinceLastReminder = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceLastReminder < 24) {
            return {
              assignmentId,
              status: 'skipped',
              message: 'Reminder already sent in last 24 hours'
            };
          }
        }

        // Generate the public access URL
        const publicAccessUrl = `${new URL(req.url).origin}/public/survey/${assignment.public_access_token}`;

        // Format deadline date and time
        const deadline = new Date(activeInstance.ends_at);
        const formattedDeadline = deadline.toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'short'
        });

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

        const recipientName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User';

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
            to: [userData.email],
            subject: `Deadline Reminder: ${surveyData.name} Due ${formattedDeadline}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Hello ${recipientName},</h2>
                <p>This is a reminder about your pending survey: <strong>${surveyData.name}</strong></p>
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

        if (!res.ok) {
          const resendError = await res.json();
          throw new Error(`Resend API error: ${JSON.stringify(resendError)}`);
        }

        // Update last_reminder_sent timestamp
        const { error: updateError } = await supabase
          .from('survey_assignments')
          .update({ last_reminder_sent: new Date().toISOString() })
          .eq('id', assignmentId);

        if (updateError) {
          console.error("Error updating last_reminder_sent:", updateError);
          throw updateError;
        }

        return {
          assignmentId,
          status: 'success',
          message: 'Reminder sent successfully'
        };

      } catch (error: any) {
        console.error(`Error processing assignment ${assignmentId}:`, error);
        return {
          assignmentId,
          status: 'error',
          message: error.message
        };
      }
    }));

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;

    return new Response(
      JSON.stringify({ 
        message: `Processed ${results.length} assignments: ${successCount} successful, ${errorCount} failed, ${skippedCount} skipped`,
        results 
      }),
      { 
        status: errorCount > 0 ? 500 : 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("Error in send-survey-reminder function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send email reminder",
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

