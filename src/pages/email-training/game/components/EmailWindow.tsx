
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Mail, Send, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Scenario } from "@/pages/admin/email-training/scenarios/types";
import type { Json } from "@/integrations/supabase/types";

interface EmailWindowProps {
  scenario: Scenario;
  onComplete: () => void;
}

interface GeneratedEmail {
  from: string;
  subject: string;
  content: string;
  tone: string;
  key_points: string[];
}

export function EmailWindow({ scenario, onComplete }: EmailWindowProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [originalEmail, setOriginalEmail] = useState<GeneratedEmail | null>(null);
  const [response, setResponse] = useState({
    subject: "",
    content: ""
  });

  useEffect(() => {
    generateEmail();
  }, [scenario]);

  const generateEmail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-training-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ scenario })
        }
      );

      if (!response.ok) throw new Error('Failed to generate email');
      
      const generatedEmail = await response.json();
      setOriginalEmail(generatedEmail);
    } catch (error) {
      console.error('Error generating email:', error);
      toast.error("Failed to generate email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!originalEmail) return;

    setIsSending(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { data: session, error: sessionError } = await supabase
        .from('email_training_sessions')
        .select()
        .eq('user_id', user.id)
        .eq('scenario_id', scenario.id)
        .eq('status', 'playing')
        .single();

      if (sessionError) throw sessionError;

      // Convert the GeneratedEmail to a proper Json type
      const jsonOriginalEmail: Json = {
        from: originalEmail.from,
        subject: originalEmail.subject,
        content: originalEmail.content,
        tone: originalEmail.tone,
        key_points: originalEmail.key_points
      };

      const jsonResponseEmail: Json = {
        subject: response.subject,
        content: response.content
      };

      const { error: responseError } = await supabase
        .from('email_responses')
        .insert({
          session_id: session.id,
          original_email: jsonOriginalEmail,
          response_email: jsonResponseEmail,
          submitted_at: new Date().toISOString()
        });

      if (responseError) throw responseError;

      const { error: updateError } = await supabase
        .from('email_training_sessions')
        .update({ status: 'submitted', completed_at: new Date().toISOString() })
        .eq('id', session.id);

      if (updateError) throw updateError;

      toast.success("Response submitted successfully!");
      onComplete();
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error("Failed to submit response. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <LoadingSpinner className="w-8 h-8" />
        </CardContent>
      </Card>
    );
  }

  if (!originalEmail) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 p-8">
          <p className="text-muted-foreground">Failed to generate email</p>
          <Button onClick={generateEmail} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Original Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Received Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">From</p>
            <p className="text-sm">{originalEmail.from}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Subject</p>
            <p className="text-sm font-medium">{originalEmail.subject}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Message</p>
            <div className="rounded-md border bg-muted p-4">
              <p className="text-sm whitespace-pre-wrap">{originalEmail.content}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Your Response
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground" htmlFor="subject">
              Subject
            </label>
            <Input
              id="subject"
              value={response.subject}
              onChange={(e) => setResponse(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter your subject line"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground" htmlFor="response">
              Message
            </label>
            <Textarea
              id="response"
              value={response.content}
              onChange={(e) => setResponse(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Type your response here..."
              className="min-h-[200px]"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSubmit} 
            className="w-full gap-2"
            disabled={!response.subject || !response.content || isSending}
          >
            {isSending ? (
              <LoadingSpinner className="w-4 h-4" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Submit Response
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
