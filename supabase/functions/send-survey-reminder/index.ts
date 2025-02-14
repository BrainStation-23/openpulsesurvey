
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
  assignmentId: string;
  surveyName: string;
  recipientEmail: string;
  recipientName: string;
  publicAccessToken: string;
  frontendUrl: string;
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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get the email configuration
    const { data: emailConfig, error: configError } = await supabase
      .from('email_config')
      .select('*')
      .single();

    if (configError) {
      console.error("Error fetching email config:", configError);
      throw new Error("Failed to fetch email configuration");
    }

    if (!emailConfig) {
      throw new Error("No email configuration found");
    }

    // Get assignment and active instance information
    const { data: assignmentData, error: assignmentError } = await supabase
      .from('survey_assignments')
      .select(`
        id,
        last_reminder_sent,
        campaign:survey_campaigns (
          instances:campaign_instances (
            id,
            ends_at,
            status
          )
        )
      `)
      .eq('id', reminderRequest.assignmentId)
      .single();

    if (assignmentError) {
      console.error("Error fetching assignment:", assignmentError);
      throw new Error("Failed to fetch assignment data");
    }

    // Find the active instance
    const activeInstance = assignmentData.campaign.instances.find(
      (instance: any) => instance.status === 'active'
    );

    if (!activeInstance) {
      throw new Error("No active instance found for this campaign");
    }

    // Check if a reminder was sent in the last 24 hours
    if (assignmentData.last_reminder_sent) {
      const lastSent = new Date(assignmentData.last_reminder_sent);
      const hoursSinceLastReminder = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastReminder < 24) {
        return new Response(
          JSON.stringify({ 
            error: "A reminder was already sent in the last 24 hours" 
          }),
          { 
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
    }

    // Generate the public access URL using the provided frontend URL
    const publicAccessUrl = `${reminderRequest.frontendUrl}/public/survey/${reminderRequest.publicAccessToken}`;

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
        to: [reminderRequest.recipientEmail],
        subject: `Deadline Reminder: ${reminderRequest.surveyName} Due ${formattedDeadline}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hello ${reminderRequest.recipientName},</h2>
            <p>This is a reminder about your pending survey: <strong>${reminderRequest.surveyName}</strong></p>
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

    console.log("Resend API response status:", res.status);
    const resendResponse = await res.json();
    console.log("Resend API response:", JSON.stringify(resendResponse));

    if (!res.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(resendResponse)}`);
    }

    // Update last_reminder_sent timestamp
    const { error: updateError } = await supabase
      .from('survey_assignments')
      .update({ last_reminder_sent: new Date().toISOString() })
      .eq('id', reminderRequest.assignmentId);

    if (updateError) {
      console.error("Error updating last_reminder_sent:", updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ message: "Reminder sent successfully" }),
      { 
        status: 200,
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
