
import { createClient } from "npm:@supabase/supabase-js@2.39.3";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Updated interface to match actual usage
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
const resend = new Resend(resendKey);

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
        )
      `)
      .in('id', assignmentIds);

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError);
      throw new Error('Failed to fetch assignments');
    }

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('survey_campaigns')
      .select('name')
      .eq('id', campaignId)
      .single();

    if (campaignError) {
      console.error('Error fetching campaign:', campaignError);
      throw new Error('Failed to fetch campaign details');
    }

    console.log('Sending reminders for campaign:', campaign.name);

    // Send emails and track results
    const results = await Promise.allSettled(
      assignments.map(async (assignment) => {
        const surveyUrl = `${frontendUrl}/public/survey/${assignment.public_access_token}`;
        const userName = assignment.user.first_name 
          ? `${assignment.user.first_name} ${assignment.user.last_name}`
          : 'there';

        try {
          await resend.emails.send({
            from: "Lovable <onboarding@resend.dev>",
            to: [assignment.user.email],
            subject: `Reminder: Complete your survey - ${campaign.name}`,
            html: `
              <h2>Hello ${userName}!</h2>
              <p>This is a friendly reminder to complete your survey for: <strong>${campaign.name}</strong></p>
              <p>Please click the link below to access your survey:</p>
              <p><a href="${surveyUrl}">${surveyUrl}</a></p>
              <p>Thank you for your participation!</p>
            `,
          });

          // Update last_reminder_sent timestamp
          const { error: updateError } = await supabase
            .from('survey_assignments')
            .update({ last_reminder_sent: new Date().toISOString() })
            .eq('id', assignment.id);

          if (updateError) {
            throw updateError;
          }

          return { 
            assignmentId: assignment.id, 
            email: assignment.user.email, 
            status: 'success' 
          };
        } catch (error) {
          console.error(`Failed to send reminder for assignment ${assignment.id}:`, error);
          return { 
            assignmentId: assignment.id, 
            email: assignment.user.email, 
            status: 'failed',
            error: error.message 
          };
        }
      })
    );

    console.log('Reminder results:', results);

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully sent ${successCount} reminders${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
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
