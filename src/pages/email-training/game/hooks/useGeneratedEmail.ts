import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Scenario } from "../../../admin/email-training/scenarios/types";
import type { GeneratedEmail } from "../types";
import { transformEmailResponse } from "../utils/emailParser";

interface EmailGenerationState {
  email: GeneratedEmail | null;
  isLoading: boolean;
  error: string | null;
}

export function useGeneratedEmail(scenario: Scenario) {
  const [state, setState] = useState<EmailGenerationState>({
    email: null,
    isLoading: true,
    error: null
  });

  const generateEmail = async () => {
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
      
      const rawData = await response.json();
      console.log('Raw email response:', rawData); // Debug log
      
      const transformedData = transformEmailResponse(rawData);
      console.log('Transformed email data:', transformedData); // Debug log

      setState({
        email: transformedData,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error generating email:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate email',
        // Keep the previous email if we have one
        email: prev.email
      }));

      toast.error("Failed to generate email. Please try again.");
    }
  };

  useEffect(() => {
    generateEmail();
  }, [scenario]);

  return {
    isLoading: state.isLoading,
    email: state.email,
    error: state.error,
    generateEmail
  };
}
