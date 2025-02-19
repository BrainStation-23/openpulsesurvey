import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Scenario } from "../../../admin/email-training/scenarios/types";
import type { GeneratedEmail } from "../types";

interface EmailGenerationState {
  email: GeneratedEmail | null;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
}

function isValidEmailResponse(data: any): data is GeneratedEmail {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.subject === 'string' &&
    typeof data.content === 'string' &&
    typeof data.from === 'object' &&
    data.from !== null &&
    typeof data.from.name === 'string' &&
    typeof data.from.email === 'string'
  );
}

export function useGeneratedEmail(scenario: Scenario) {
  const [state, setState] = useState<EmailGenerationState>({
    email: null,
    isLoading: true,
    error: null,
    retryCount: 0
  });

  const generateEmail = async (isRetry = false) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const response = await fetch(
        "https://iqpgjxbqoeioqlfzosvu.supabase.co/functions/v1/generate-training-email",
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxcGdqeGJxb2Vpb3FsZnpvc3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxNzg3MDYsImV4cCI6MjA1Mjc1NDcwNn0.Pt2ZONdaxW9ofQ3bijC2vknLL4jYgAZSgJEcNmYJjSY'
          },
          body: JSON.stringify({ scenario })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!isValidEmailResponse(data)) {
        console.error('Invalid email response structure:', data);
        throw new Error('Received malformed data from the server');
      }

      setState(prev => ({
        ...prev,
        email: data,
        isLoading: false,
        error: null,
        retryCount: 0
      }));
    } catch (error) {
      console.error('Error generating email:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate email',
        retryCount: prev.retryCount + 1
      }));

      if (!isRetry) {
        toast.error("Failed to generate email. Retrying...");
      }

      if (state.retryCount < 3) {
        const retryDelay = Math.min(1000 * Math.pow(2, state.retryCount), 5000);
        setTimeout(() => generateEmail(true), retryDelay);
      } else {
        toast.error("Could not generate email after multiple attempts. Please try again later.");
      }
    }
  };

  useEffect(() => {
    generateEmail();
  }, [scenario]);

  return {
    isLoading: state.isLoading,
    email: state.email,
    error: state.error,
    generateEmail: () => generateEmail(),
    retryCount: state.retryCount
  };
}
