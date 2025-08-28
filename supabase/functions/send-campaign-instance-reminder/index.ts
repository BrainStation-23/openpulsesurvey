
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

async function sendBatchReminders(assignments: any[], emailConfig: any, instance: any, frontendUrl: string) {
  let successCount = 0;
  let failureCount = 0;

  // Prepare batch emails for Resend
  const batchEmails = assignments.map((assignment) => {
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
      tags: [{
        name: 'campaign_id',
        value: instance.campaign_id
      }, {
        name: 'instance_id', 
        value: instance.id
      }]
    };
  });

  try {
    console.log(`Sending batch of ${batchEmails.length} emails using Resend batch API`);
    
    const response = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify(batchEmails),
    });

    if (!response.ok) {
      const responseData = await response.json();
      console.error("Batch email send error:", responseData);
      throw new Error(`Failed to send batch emails: ${responseData.message}`);
    }

    const batchResult = await response.json();
    console.log("Batch email response:", batchResult);

    // Count successful and failed emails
    if (batchResult.data) {
      batchResult.data.forEach((result: any) => {
        if (result.id) {
          successCount++;
        } else {
          failureCount++;
          console.error("Failed email in batch:", result);
        }
      });
    }

    // Update last_reminder_sent timestamp for all assignments
    const assignmentIds = assignments.map(a => a.id);
    const { error: updateError } = await supabase
      .from('survey_assignments')
      .update({ last_reminder_sent: new Date().toISOString() })
      .in('id', assignmentIds);

    if (updateError) {
      console.error('Failed to update last_reminder_sent for assignments:', updateError);
    }

    console.log(`Batch send completed: ${successCount} successful, ${failureCount} failed`);

  } catch (error) {
    console.error('Error sending batch emails:', error);
    failureCount = assignments.length;
  }

  return { successCount, failureCount, skippedCount: 0 };
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

    // Send batch emails using Resend's batch API
    const results = await sendBatchReminders(assignments, emailConfig, instance, frontendUrl);

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
