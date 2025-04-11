
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EdgeFunctionExampleProps {
  templateId: string;
  templateName: string;
}

export default function EdgeFunctionExample({ templateId, templateName }: EdgeFunctionExampleProps) {
  const [code, setCode] = useState(`// Example of how to use this email template in an edge function

export async function sendEmail(recipientEmail, variables) {
  // Get the email template from the database
  const { data: template } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', '${templateId}')
    .single();
    
  if (!template) {
    throw new Error('Template not found');
  }
  
  // Replace variables in the template
  let htmlContent = template.html_content;
  let subject = template.subject;
  
  // Replace each variable with its value
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(\`{{${key}}}\`, 'g');
    htmlContent = htmlContent.replace(regex, String(value));
    subject = subject.replace(regex, String(value));
  });
  
  // Send the email using your preferred email service
  // This is just a pseudocode example:
  
  // const emailResult = await emailService.send({
  //   to: recipientEmail,
  //   subject: subject,
  //   html: htmlContent,
  //   from: 'noreply@yourdomain.com'
  // });
  
  return { success: true };
}`);

  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Code copied',
      description: 'Edge function example code copied to clipboard'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edge Function Integration</CardTitle>
        <CardDescription>
          Example code for using the "{templateName}" template in an edge function
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="code-example">Implementation Example</Label>
          <Textarea
            id="code-example"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="font-mono h-[300px]"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={copyToClipboard}>Copy to Clipboard</Button>
      </CardFooter>
    </Card>
  );
}
