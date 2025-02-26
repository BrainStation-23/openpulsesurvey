
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface SessionValidationProps {
  joinCode: string | undefined;
  setIsValidating: (value: boolean) => void;
}

export function SessionValidation({ joinCode, setIsValidating }: SessionValidationProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const validateSession = async () => {
      setIsValidating(true);
      try {
        // Check if session exists and is active
        const { data: session, error } = await supabase
          .from("live_survey_sessions")
          .select("id, status")
          .eq("join_code", joinCode)
          .single();

        if (error || !session) {
          navigate("/live");
          return;
        }

        if (session.status === "ended") {
          navigate("/live");
          return;
        }

        // Check if user has already joined
        const storedInfo = localStorage.getItem(`live_session_${joinCode}`);
        if (!storedInfo) {
          // Redirect to join page if no participant info
          navigate(`/live/${joinCode}/join`);
          return;
        }
      } catch (error) {
        console.error("Error validating session:", error);
        navigate("/live");
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();
  }, [joinCode, navigate, setIsValidating]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <LoadingSpinner className="mx-auto" />
        <p className="text-muted-foreground">Validating session...</p>
      </div>
    </div>
  );
}
