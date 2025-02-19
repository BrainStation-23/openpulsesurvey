
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Scenario } from "../../types";
import { useGeneratedEmail } from "../hooks/useGeneratedEmail";
import { EmailList } from "./email-list/EmailList";
import { EmailHeader } from "./email/EmailHeader";
import { EmailContent } from "./email/EmailContent";
import { EmailEditor } from "./email/EmailEditor";
import type { EmailResponse } from "../types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable";
import { GradingDisplay } from "./grading/GradingDisplay";
import { AIResponse } from "./email/AIResponse";
import type { GradingResponse } from "../types";

interface EmailWindowProps {
  scenario: Scenario;
  onComplete: () => void;
}

export function EmailWindow({ scenario, onComplete }: EmailWindowProps) {
  const { isLoading, email: originalEmail, generateEmail } = useGeneratedEmail(scenario);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gradingResponse, setGradingResponse] = useState<GradingResponse | null>(null);
  const [currentSession, setCurrentSession] = useState<{ id: string } | null>(null);
  const [currentResponse, setCurrentResponse] = useState<{ id: string } | null>(null);

  const handleSubmit = async (response: EmailResponse) => {
    try {
      setIsSubmitting(true);

      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // If no session exists, create one
      if (!currentSession) {
        const { data: session, error: sessionError } = await supabase
          .from('email_training_sessions')
          .insert({
            scenario_id: scenario.id,
            user_id: user.id,
            status: 'playing'
          })
          .select()
          .single();

        if (sessionError) throw sessionError;
        setCurrentSession(session);
      }

      // Save the response
      const { data: emailResponse, error: responseError } = await supabase
        .from('email_responses')
        .insert([{
          original_email: JSON.stringify(originalEmail),
          response_email: JSON.stringify(response),
          session_id: currentSession?.id,
          attempt_number: currentAttempt
        }])
        .select()
        .single();

      if (responseError) throw responseError;
      setCurrentResponse(emailResponse);

      // Send to AI for analysis
      const analysisResponse = await fetch('/api/analyze-training-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession?.id,
          responseId: emailResponse.id,
          originalEmail,
          userResponse: response,
          attemptNumber: currentAttempt
        })
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze response');
      }

      const gradingData: GradingResponse = await analysisResponse.json();
      setGradingResponse(gradingData);

      if (gradingData.isComplete) {
        toast.success("Training completed!");
        onComplete();
      } else {
        setCurrentAttempt(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error("Failed to submit response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <LoadingSpinner className="w-8 h-8" />
        </div>
      </Card>
    );
  }

  if (!originalEmail) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Failed to generate email</p>
          <Button onClick={generateEmail} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="h-[900px] rounded-lg border bg-card">
      <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg overflow-hidden">
        <ResizablePanel defaultSize={25} minSize={15}>
          <EmailList email={originalEmail} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75}>
          <div className="flex h-full flex-col bg-background">
            <EmailHeader email={originalEmail} />
            <div className="flex-1 overflow-auto p-6 space-y-6">
              <EmailContent email={originalEmail} />
              
              {gradingResponse && (
                <>
                  <GradingDisplay 
                    grade={gradingResponse.grade} 
                    attemptNumber={currentAttempt - 1} 
                  />
                  <AIResponse response={gradingResponse.aiResponse} />
                </>
              )}
            </div>
            <div className="border-t p-6">
              <EmailEditor 
                onSubmit={handleSubmit} 
                isSubmitting={isSubmitting}
                disabled={gradingResponse?.isComplete}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
