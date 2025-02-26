
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ActiveQuestion } from "../types";

export function useSessionSubscription(
  sessionId: string | null,
  activeQuestion: ActiveQuestion | null,
  onQuestionUpdate: (question: ActiveQuestion) => void,
  onResponsesUpdate: (responses: any[]) => void
) {
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_session_questions",
          filter: `session_id=eq.${sessionId} AND status=eq.active`,
        },
        (payload: any) => {
          if (payload.new) {
            const questionData = payload.new.question_data as {
              title: string;
              type: string;
              choices?: { text: string; value: string; }[];
            };

            const newQuestion: ActiveQuestion = {
              id: payload.new.id,
              question_key: payload.new.question_key,
              question_data: questionData,
              session_id: sessionId,
              status: payload.new.status,
              display_order: payload.new.display_order
            };

            onQuestionUpdate(newQuestion);
            onResponsesUpdate([]);
          }
        }
      )
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
  }, [sessionId, activeQuestion?.question_key, onQuestionUpdate, onResponsesUpdate]);
}
