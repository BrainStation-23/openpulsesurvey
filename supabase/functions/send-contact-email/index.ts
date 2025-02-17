
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

interface EmailResult {
  success: boolean;
  error?: string;
  data?: any;
}

async function validateEnvironment() {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const recipientEmail = Deno.env.get("CONTACT_FORM_RECIPIENT_EMAIL");

  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!recipientEmail) {
    throw new Error("CONTACT_FORM_RECIPIENT_EMAIL is not configured");
  }

  return {
    resendApiKey,
    recipientEmail,
  };
}

async function sendEmail(resend: Resend, options: any): Promise<EmailResult> {
  try {
    console.log(`Attempting to send email to: ${options.to}`);
    const response = await resend.emails.send(options);
    console.log(`Email sent successfully to: ${options.to}`, response);
    return { success: true, data: response };
  } catch (error) {
    console.error(`Failed to send email to: ${options.to}`, error);
    return { success: false, error: error.message };
  }
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment first
    const { resendApiKey, recipientEmail } = await validateEnvironment();
    console.log("Environment validated successfully");

    // Initialize clients
    const resend = new Resend(resendApiKey);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request data
    const { name, email, message }: ContactFormData = await req.json();
    console.log(`Processing contact form submission from: ${email}`);

    // Store the message in the database with initial pending status
    const { data: contactMessage, error: dbError } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        message,
        status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to store contact message');
    }

    // Send email to admin
    const adminEmailResult = await sendEmail(resend, {
      from: 'Open Office Survey <noreply@brainstation-23.com>',
      to: recipientEmail.split(',').map(email => email.trim()),
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr>
        <p><small>Received on: ${new Date().toLocaleString()}</small></p>
      `,
    });

    if (!adminEmailResult.success) {
      // Update message status to failed
      await supabase
        .from('contact_messages')
        .update({ 
          status: 'failed',
          error_message: `Failed to send admin notification: ${adminEmailResult.error}`
        })
        .eq('id', contactMessage.id);

      throw new Error(`Failed to send admin notification: ${adminEmailResult.error}`);
    }

    // Send confirmation email to user
    const userEmailResult = await sendEmail(resend, {
      from: 'Open Office Survey <noreply@brainstation-23.com>',
      to: [email],
      subject: 'We received your message',
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>Dear ${name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p>For your records, here's a copy of your message:</p>
        <blockquote>${message}</blockquote>
        <br>
        <p>Best regards,<br>The Open Office Survey Team</p>
      `,
    });

    if (!userEmailResult.success) {
      // Update message status to partially_sent
      await supabase
        .from('contact_messages')
        .update({ 
          status: 'partially_sent',
          error_message: `Failed to send user confirmation: ${userEmailResult.error}`
        })
        .eq('id', contactMessage.id);

      console.warn(`Admin notification sent but user confirmation failed for message ID: ${contactMessage.id}`);
    } else {
      // Both emails sent successfully, update status
      await supabase
        .from('contact_messages')
        .update({ 
          status: 'sent',
          sent_to: recipientEmail.split(',').map(email => email.trim())
        })
        .eq('id', contactMessage.id);
    }

    // Return appropriate response
    return new Response(
      JSON.stringify({
        success: true,
        adminEmail: adminEmailResult,
        userEmail: userEmailResult,
        messageId: contactMessage.id
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );

  } catch (error) {
    console.error('Error processing contact form:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to process contact form submission'
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});
