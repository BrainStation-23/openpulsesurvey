
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
  assignmentIds: string[];
  frontendUrl: string;
}

// Process emails using Resend batch API (up to 100 emails at a time)
async function processBatch(assignments: any[], emailConfig: any, instance: any, frontendUrl: string) {
  const BATCH_SIZE = 100; // Resend batch API limit
  
  let successCount = 0;
  let failureCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < assignments.length; i += BATCH_SIZE) {
    const batch = assignments.slice(i, i + BATCH_SIZE);
    
    try {
      // Filter out assignments that need cooldown
      const eligibleAssignments = batch.filter(assignment => {
        if (assignment.last_reminder_sent) {
          const lastSent = new Date(assignment.last_reminder_sent);
          const hoursSinceLastReminder = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceLastReminder < 24) {
            skippedCount++;
            return false;
          }
        }
        return true;
      });

      if (eligibleAssignments.length === 0) {
        continue;
      }

      console.log(`Processing batch of ${eligibleAssignments.length} eligible emails...`);

      // Prepare batch emails
      const batchEmails = eligibleAssignments.map(assignment => {
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

        return {
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
        };
      });

      // Send batch emails using Resend batch API
      const response = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(batchEmails),
      });

      if (!response.ok) {
        const responseData = await response.json();
        console.error("Batch email send error:", responseData);
        throw new Error(`Failed to send batch emails: ${responseData.message}`);
      }

      const batchResult = await response.json();
      console.log("Batch email result:", batchResult);

      // Update last_reminder_sent timestamp for all eligible assignments
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
      const assignmentIds = eligibleAssignments.map(a => a.id);
      
      const { error: updateError } = await supabase
        .from('survey_assignments')
        .update({ last_reminder_sent: new Date().toISOString() })
        .in('id', assignmentIds);

      if (updateError) {
        console.error("Update error:", updateError);
        throw new Error("Failed to update reminder timestamps");
      }

      successCount += eligibleAssignments.length;
      console.log(`Successfully sent ${eligibleAssignments.length} reminders in batch`);

    } catch (error) {
      console.error(`Error processing batch starting at index ${i}:`, error);
      failureCount += batch.filter(assignment => {
        if (assignment.last_reminder_sent) {
          const lastSent = new Date(assignment.last_reminder_sent);
          const hoursSinceLastReminder = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
          return hoursSinceLastReminder >= 24;
        }
        return true;
      }).length;
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
    console.log("Starting reminder process...");
    
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials are not configured");
    }

    const { instanceId, campaignId, assignmentIds, frontendUrl }: ReminderRequest = await req.json();
    console.log("Reminder request:", { instanceId, campaignId, assignmentIds, frontendUrl });

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

    // Get instance details if provided
    let instance;
    if (instanceId) {
      const { data, error: instanceError } = await supabase
        .from('campaign_instances')
        .select('*')
        .eq('id', instanceId)
        .single();

      if (instanceError) {
        console.error("Instance error:", instanceError);
        throw new Error("Failed to fetch instance details");
      }

      instance = data;
    }

    // Get only the selected assignments with user and survey details
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
      .in('id', assignmentIds);

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

    console.log(`Processing ${assignments.length} selected assignments using Resend batch API...`);

    // Process selected assignments using batch API
    const { successCount, failureCount, skippedCount } = await processBatch(
      assignments,
      emailConfig,
      instance,
      frontendUrl
    );

    return new Response(
      JSON.stringify({ 
        message: `Processed ${assignments.length} assignments using Resend batch API`,
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
    console.error("Error in send-survey-reminder function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send reminders",
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
