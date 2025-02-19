
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Scenario } from "../../../admin/email-training/scenarios/types";
import { useGeneratedEmail } from "../hooks/useGeneratedEmail";
import { EmailHeader } from "./email/EmailHeader";
import { EmailContent } from "./email/EmailContent";
import { EmailEditor } from "./email/EmailEditor";
import type { EmailResponse } from "../types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailWindowProps {
  scenario: Scenario;
  onComplete: () => void;
}

export function EmailWindow({ scenario, onComplete }: EmailWindowProps) {
  const { isLoading, email: originalEmail, generateEmail } = useGeneratedEmail(scenario);

  const handleSubmit = async (response: EmailResponse) => {
    try {
      // Get the current user's ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // Get the active session
      const { data: session, error: sessionError } = await supabase
        .from('email_training_sessions')
        .select()
        .eq('user_id', user.id)
        .eq('scenario_id', scenario.id)
        .eq('status', 'playing')
        .single();

      if (sessionError) throw sessionError;

      // Save the response
      const { error: responseError } = await supabase
        .from('email_responses')
        .insert({
          session_id: session.id,
          original_email: JSON.stringify(originalEmail),
          response_email: JSON.stringify(response),
          submitted_at: new Date().toISOString()
        });

      if (responseError) throw responseError;

      // Update session status
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
      throw error;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner className="w-8 h-8" />
        </div>
      </Card>
    );
  }

  if (!originalEmail) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center gap-4 p-8">
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <EmailHeader email={originalEmail} />
          <div className="p-6">
            <EmailContent email={originalEmail} />
          </div>
        </Card>
      </div>
      <div className="space-y-4">
        <Card className="p-6">
          <EmailEditor onSubmit={handleSubmit} />
        </Card>
      </div>
    </div>
  );
}
