
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Scenario } from "../../../admin/email-training/scenarios/types";
import type { GeneratedEmail } from "../types";

export function useGeneratedEmail(scenario: Scenario) {
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState<GeneratedEmail | null>(null);

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
      setEmail(generatedEmail);
    } catch (error) {
      console.error('Error generating email:', error);
      toast.error("Failed to generate email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateEmail();
  }, [scenario]);

  return {
    isLoading,
    email,
    generateEmail
  };
}
