
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const recipientEmail = Deno.env.get("CONTACT_FORM_RECIPIENT_EMAIL");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (!recipientEmail) {
      throw new Error("Recipient email not configured");
    }

    const { name, email, message }: ContactFormData = await req.json();

    // Store the message in the database first
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
    const adminEmailResponse = await resend.emails.send({
      from: 'Open Office Survey <onboarding@resend.dev>',
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

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: 'Open Office Survey <onboarding@resend.dev>',
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

    // Update the message status in the database
    const { error: updateError } = await supabase
      .from('contact_messages')
      .update({ 
        status: 'sent',
        sent_to: recipientEmail.split(',').map(email => email.trim())
      })
      .eq('id', contactMessage.id);

    if (updateError) {
      console.error('Error updating message status:', updateError);
    }

    return new Response(
      JSON.stringify({ success: true, adminEmail: adminEmailResponse, userEmail: userEmailResponse }),
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
