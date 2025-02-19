
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
