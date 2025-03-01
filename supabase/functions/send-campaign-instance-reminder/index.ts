
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  assignmentIds: string[];
  campaignId: string;
  instanceId?: string;
  frontendUrl: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendKey = Deno.env.get('RESEND_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to delay between batches
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
              Authorization: `Bearer ${resendKey}`,
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

          // Update last_reminder_sent timestamp
          const { error: updateError } = await supabase
            .from('survey_assignments')
            .update({ last_reminder_sent: new Date().toISOString() })
            .eq('id', assignment.id);

          if (updateError) {
            console.error(`Failed to update last_reminder_sent for assignment ${assignment.id}:`, updateError);
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assignmentIds, campaignId, instanceId, frontendUrl }: ReminderRequest = await req.json();

    console.log('Processing reminder request:', { assignmentIds, campaignId, instanceId });

    if (!assignmentIds || !Array.isArray(assignmentIds) || assignmentIds.length === 0) {
      throw new Error('Invalid assignment IDs provided');
    }

    // Get email configuration
    const { data: emailConfig, error: emailConfigError } = await supabase
      .from('email_config')
      .select('*')
      .eq('provider', 'resend')
      .maybeSingle();

    if (emailConfigError || !emailConfig) {
      throw new Error('Failed to fetch email configuration');
    }

    // Get instance details
    const { data: instance, error: instanceError } = await supabase
      .from('campaign_instances')
      .select('*')
      .eq('id', instanceId)
      .single();

    if (instanceError || !instance) {
      throw new Error('Failed to fetch instance details');
    }

    // Fetch assignments with user details
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
          name,
          description
        )
      `)
      .in('id', assignmentIds);

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError);
      throw new Error('Failed to fetch assignments');
    }

    // Process assignments in batches
    const results = await processBatch(assignments, emailConfig, instance, frontendUrl);

    console.log('Reminder results:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully sent ${results.successCount} reminders${results.failureCount > 0 ? `, ${results.failureCount} failed` : ''}`,
        results
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Error in send-campaign-instance-reminder:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
