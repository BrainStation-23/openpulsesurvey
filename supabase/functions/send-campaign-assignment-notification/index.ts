
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  assignmentIds: string[];
  campaignId: string;
  instanceId?: string;
  frontendUrl: string;
  customMessage?: string; // Optional parameter for custom message
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendKey = Deno.env.get('RESEND_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to delay between batches
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Format date to human readable format
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short'
  });
};

async function processBatch(assignments: any[], emailConfig: any, instance: any, frontendUrl: string, customMessage?: string) {
  const BATCH_SIZE = 2; // Process 2 emails at a time (Resend's limit)
  const DELAY_BETWEEN_BATCHES = 1100; // Wait 1.1 seconds between batches
  
  let successCount = 0;
  let failureCount = 0;
  let skippedCount = 0;

  // Get campaign information (for anonymity status)
  const { data: campaignData, error: campaignError } = await supabase
    .from('survey_campaigns')
    .select('anonymous')
    .eq('id', assignments[0]?.survey?.campaign_id)
    .maybeSingle();

  if (campaignError) {
    console.error('Error fetching campaign data:', campaignError);
  }

  const isAnonymous = campaignData?.anonymous || false;

  for (let i = 0; i < assignments.length; i += BATCH_SIZE) {
    const batch = assignments.slice(i, i + BATCH_SIZE);
    
    // Process each email in the current batch concurrently
    const batchResults = await Promise.allSettled(
      batch.map(async (assignment) => {
        try {
          const recipientName = `${assignment.user.first_name || ''} ${assignment.user.last_name || ''}`.trim() || 'Participant';
          
          // Login URL for the user to access their surveys
          const loginUrl = `${frontendUrl}/login`;

          // Format instance dates for human readability
          const startDate = formatDate(instance.starts_at);
          const endDate = formatDate(instance.ends_at);

          console.log("Sending assignment notification to:", assignment.user.email);

          // Generate anonymity message based on campaign setting
          const anonymityMessage = isAnonymous
            ? '<div style="background-color: #ebf8ee; border-left: 4px solid #10b981; padding: 1rem; margin: 1rem 0;"><p style="font-weight: bold; margin: 0;">Anonymous Survey</p><p style="margin: 0.5rem 0;">Your responses will remain anonymous and cannot be traced back to you individually.</p></div>'
            : '<div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 1rem; margin: 1rem 0;"><p style="font-weight: bold; margin: 0;">Non-Anonymous Survey</p><p style="margin: 0.5rem 0;">Please note that your responses are not anonymous and can be linked to your identity.</p></div>';

          // Add custom message if provided
          const customMessageHtml = customMessage 
            ? `<div style="background-color: #f8f9fa; border-left: 4px solid #6366f1; padding: 1rem; margin: 1rem 0;"><p style="margin: 0.5rem 0;"><strong>Message from administrator:</strong></p><p style="margin: 0.5rem 0;">${customMessage}</p></div>`
            : '';

          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendKey}`,
            },
            body: JSON.stringify({
              from: `${emailConfig.from_name} <${emailConfig.from_email}>`,
              to: [assignment.user.email],
              subject: `New Survey Assignment: ${assignment.survey.name}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Hello ${recipientName},</h2>
                  <p>You have been assigned a new survey: <strong>${assignment.survey.name}</strong></p>
                  
                  ${anonymityMessage}
                  
                  ${customMessageHtml}
                  
                  <div style="background-color: #f8f9fa; border-left: 4px solid #2563eb; padding: 1rem; margin: 1rem 0;">
                    <p style="margin: 0.5rem 0;"><strong>Survey Period:</strong></p>
                    <p style="margin: 0.5rem 0;">Starts: ${startDate}</p>
                    <p style="margin: 0.5rem 0;">Ends: ${endDate}</p>
                  </div>
                  <p>Please log in to your account to complete the survey:</p>
                  <p><a href="${loginUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Log In</a></p>
                  <p style="color: #666; font-size: 14px;">If the button doesn't work, you can copy and paste this link into your browser: ${loginUrl}</p>
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

          // Update last_notification_sent timestamp
          const { error: updateError } = await supabase
            .from('survey_assignments')
            .update({ last_reminder_sent: new Date().toISOString() })
            .eq('id', assignment.id);

          if (updateError) {
            console.error(`Failed to update last_reminder_sent for assignment ${assignment.id}:`, updateError);
          }

          successCount++;
          console.log("Successfully sent assignment notification to:", assignment.user.email);
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
    const { assignmentIds, campaignId, instanceId, frontendUrl, customMessage }: NotificationRequest = await req.json();

    console.log('Processing assignment notification request:', { 
      assignmentIds, 
      campaignId, 
      instanceId, 
      hasCustomMessage: !!customMessage 
    });

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

    // Fetch assignments with user details - Fixed Query
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
          description,
          campaign_id
        )
      `)
      .in('id', assignmentIds);

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError);
      throw new Error('Failed to fetch assignments');
    }

    // Process assignments in batches
    const results = await processBatch(assignments, emailConfig, instance, frontendUrl, customMessage);

    console.log('Assignment notification results:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully sent ${results.successCount} notifications${results.failureCount > 0 ? `, ${results.failureCount} failed` : ''}`,
        results
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Error in send-campaign-assignment-notification:', error);
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
