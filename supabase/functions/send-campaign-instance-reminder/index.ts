
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
  frontendUrl: string;
}

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Process emails in batches with rate limiting
async function processBatch(assignments: any[], emailConfig: any, instance: any, frontendUrl: string) {
  const BATCH_SIZE = 2; // Process 2 emails at a time (Resend's limit)
  const DELAY_BETWEEN_BATCHES = 1100; // Wait 1.1 seconds between batches
  
  let successCount = 0;
  let failureCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < assignments.length; i += BATCH_SIZE) {
    const batch = assignments.slice(i, i + BATCH_SIZE);
    
    // Process each email in the current batch concurrently
    const batchResults = await Promise.allSettled(
      batch.map(async (assignment) => {
        try {
          const recipientName = `${assignment.user.first_name || ''} ${assignment.user.last_name || ''}`.trim() || 'Participant';
          const publicAccessUrl = `${frontendUrl}/public/survey/${assignment.public_access_token}`;

          const deadline = new Date(instance.ends_at);
          const formattedDeadline = deadline.toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short'
          });

          const now = new Date();
          const hoursRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
          const daysRemaining = Math.ceil(hoursRemaining / 24);
          
          const urgencyMessage = daysRemaining <= 1
            ? `⚠️ This survey must be completed within the next ${hoursRemaining} hours.`
            : `You have ${daysRemaining} days to complete this survey.`;

          console.log("Sending instance reminder to:", assignment.user.email);

          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: `${emailConfig.from_name} <${emailConfig.from_email}>`,
              to: [assignment.user.email],
              subject: `New Survey Period Started: ${assignment.survey.name}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Hello ${recipientName},</h2>
                  <p>A new survey period has started for: <strong>${assignment.survey.name}</strong></p>
                  <div style="background-color: #f8f9fa; border-left: 4px solid #2563eb; padding: 1rem; margin: 1rem 0;">
                    <p style="margin: 0; color: #1e40af;"><strong>DEADLINE: ${formattedDeadline}</strong></p>
                    <p style="margin-top: 0.5rem; color: #4b5563;">${urgencyMessage}</p>
                  </div>
                  <p>Please complete the survey by clicking the link below:</p>
                  <p><a href="${publicAccessUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Start Survey</a></p>
                  <p style="color: #666; font-size: 14px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
                  <p style="color: #666; font-size: 14px;">${publicAccessUrl}</p>
                  <p>Thank you for your participation!</p>
                </div>
              `,
            }),
          });

          if (!response.ok) {
            const responseData = await response.json();
            console.error("Email send error:", responseData);
            throw new Error(`Failed to send email to ${assignment.user.email}: ${responseData.message}`);
          }

          successCount++;
          console.log("Successfully sent instance reminder to:", assignment.user.email);
        } catch (error) {
          console.error(`Error processing assignment ${assignment.id}:`, error);
          failureCount++;
        }
      })
    );

    // Wait before processing the next batch to respect rate limits
    if (i + BATCH_SIZE < assignments.length) {
      console.log(`Waiting ${DELAY_BETWEEN_BATCHES}ms before processing next batch...`);
      await delay(DELAY_BETWEEN_BATCHES);
    }
  }

  return { successCount, failureCount, skippedCount };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting instance reminder process...");
    
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials are not configured");
    }

    const { instanceId, frontendUrl }: ReminderRequest = await req.json();
    console.log("Instance reminder request:", { instanceId, frontendUrl });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get the email configuration
    const { data: emailConfig, error: configError } = await supabase
      .from('email_config')
      .select('*')
      .maybeSingle();

    if (configError) {
      console.error("Email config error:", configError);
      throw new Error("Failed to fetch email configuration");
    }

    if (!emailConfig) {
      throw new Error("No email configuration found");
    }

    // Get instance details
    const { data: instance, error: instanceError } = await supabase
      .from('campaign_instances')
      .select(`
        *,
        campaign:survey_campaigns (
          id
        )
      `)
      .eq('id', instanceId)
      .single();

    if (instanceError) {
      console.error("Instance error:", instanceError);
      throw new Error("Failed to fetch instance details");
    }

    if (!instance) {
      throw new Error("Instance not found");
    }

    // Get assignments with user and survey details
    const { data: assignments, error: assignmentsError } = await supabase
      .from('survey_assignments')
      .select(`
        id,
        public_access_token,
        user:profiles!survey_assignments_user_id_fkey (
          email,
          first_name,
          last_name
        ),
        survey:surveys (
          name
        )
      `)
      .eq('campaign_id', instance.campaign.id);

    if (assignmentsError) {
      console.error("Assignments error:", assignmentsError);
      throw new Error("Failed to fetch assignments");
    }

    if (!assignments?.length) {
      return new Response(
        JSON.stringify({ 
          message: "No assignments found",
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

    console.log(`Processing ${assignments.length} assignments in batches...`);

    // Process all assignments with rate limiting
    const { successCount, failureCount, skippedCount } = await processBatch(
      assignments,
      emailConfig,
      instance,
      frontendUrl
    );

    return new Response(
      JSON.stringify({ 
        message: `Processed ${assignments.length} assignments with rate limiting`,
        successCount,
        failureCount,
        skippedCount
      }),
      { 
        status: failureCount > 0 ? 500 : 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("Error in send-campaign-instance-reminder function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send instance reminder emails",
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
