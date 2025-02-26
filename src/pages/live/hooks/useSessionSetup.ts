
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ActiveQuestion } from "../types";
import { convertToActiveQuestion } from "./utils/questionConverter";

export function useSessionSetup(joinCode: string) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const setupSession = async () => {
      try {
        const { data: session, error: sessionError } = await supabase
          .from("live_survey_sessions")
          .select("id, status")
          .eq("join_code", joinCode)
          .single();

        if (sessionError || !session) {
          throw new Error("Session not found");
        }

        if (session.status === "ended") {
          throw new Error("This session has ended");
        }

        setSessionId(session.id);

        const { data: question, error: questionError } = await supabase
          .from("live_session_questions")
          .select("*")
          .eq("session_id", session.id)
          .eq("status", "active")
          .single();

        if (!questionError && question) {
          return convertToActiveQuestion(question);
        }
        return null;
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Unable to join session",
          variant: "destructive",
        });
        navigate("/live");
        return null;
      } finally {
        setIsLoading(false);
      }
    };

    setupSession();
  }, [joinCode, toast, navigate]);

  return { isLoading, sessionId };
}
