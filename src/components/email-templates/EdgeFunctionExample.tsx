
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function EdgeFunctionExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How to Use Email Templates</CardTitle>
        <CardDescription>
          Examples for sending emails from Supabase Edge Functions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="resend">
          <TabsList className="mb-4">
            <TabsTrigger value="resend">Resend</TabsTrigger>
            <TabsTrigger value="sendgrid">SendGrid</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resend">
            <pre className="p-4 rounded-md bg-muted overflow-auto text-sm">
              {`// Edge function for sending email with template
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@1.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templateId, recipientEmail, variableName, variables } = await req.json();
    
    // Fetch template from Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const { data: template, error } = await supabase
      .from("email_templates")
      .select("*")
      .eq("id", templateId)
      .eq("status", "active")
      .single();
      
    if (error || !template) {
      throw new Error(\`Template not found: \${error?.message}\`);
    }
    
    // Replace variables in the template
    let htmlContent = template.html_content;
    let textContent = template.plain_text_content;
    let subject = template.subject;
    
    // Process variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(\`\\{\\{\${key}\\}\\}\`, "g");
      htmlContent = htmlContent.replace(regex, String(value));
      textContent = textContent.replace(regex, String(value));
      subject = subject.replace(regex, String(value));
    });
    
    // Send email with Resend
    const emailResponse = await resend.emails.send({
      from: "noreply@yourdomain.com",
      to: [recipientEmail],
      subject: subject,
      html: htmlContent,
      text: textContent,
    });

    return new Response(
      JSON.stringify({ success: true, id: emailResponse.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});`}
            </pre>
          </TabsContent>
          
          <TabsContent value="sendgrid">
            <pre className="p-4 rounded-md bg-muted overflow-auto text-sm">
              {`// Edge function for sending email with template via SendGrid
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templateId, recipientEmail, variables } = await req.json();
    
    // Fetch template from Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const { data: template, error } = await supabase
      .from("email_templates")
      .select("*")
      .eq("id", templateId)
      .eq("status", "active")
      .single();
      
    if (error || !template) {
      throw new Error(\`Template not found: \${error?.message}\`);
    }
    
    // Replace variables in the template
    let htmlContent = template.html_content;
    let textContent = template.plain_text_content;
    let subject = template.subject;
    
    // Process variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(\`\\{\\{\${key}\\}\\}\`, "g");
      htmlContent = htmlContent.replace(regex, String(value));
      textContent = textContent.replace(regex, String(value));
      subject = subject.replace(regex, String(value));
    });
    
    // Send email with SendGrid
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${Deno.env.get("SENDGRID_API_KEY")}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: recipientEmail }],
          },
        ],
        from: { email: "noreply@yourdomain.com" },
        subject: subject,
        content: [
          {
            type: "text/plain",
            value: textContent,
          },
          {
            type: "text/html",
            value: htmlContent,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(\`SendGrid API error: \${JSON.stringify(errorData)}\`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});`}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
