
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ActiveQuestion } from "../types";

export function useSessionSubscription(
  sessionId: string | null,
  activeQuestion: ActiveQuestion | null,
  onQuestionUpdate: (question: ActiveQuestion | null) => void,
  onResponsesUpdate: (responses: any[]) => void
) {
  const { toast } = useToast();

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session_${sessionId}`)
      // Question updates subscription
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_session_questions",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload: any) => {
          const question = payload.new;
          
          switch (payload.eventType) {
            case "UPDATE":
              if (question.status === "active") {
                onQuestionUpdate(question);
                onResponsesUpdate([]); // Reset responses for new question
              } else if (
                question.status === "completed" &&
                activeQuestion?.id === question.id
              ) {
                onQuestionUpdate(null);
              }
              break;

            case "INSERT":
              if (question.status === "active") {
                onQuestionUpdate(question);
                onResponsesUpdate([]);
              }
              break;
          }
        }
      )
      // Response updates subscription
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_session_responses",
          filter: `session_id=eq.${sessionId}`,
        },
        async (payload: any) => {
          if (!activeQuestion) return;

          // Only handle responses for current question
          if (payload.new.question_key !== activeQuestion.question_key) return;

          // Get updated responses for the current question
          const { data: responses } = await supabase
            .from("live_session_responses")
            .select("*")
            .eq("session_id", sessionId)
            .eq("question_key", activeQuestion.question_key);

          onResponsesUpdate(responses || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, activeQuestion, onQuestionUpdate, onResponsesUpdate, toast]);
}
