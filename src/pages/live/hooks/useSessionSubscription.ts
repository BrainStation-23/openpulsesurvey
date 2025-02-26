import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ActiveQuestion } from "../types";
import { Json } from "@/integrations/supabase/types";

// Helper function to convert database question to ActiveQuestion type
function convertToActiveQuestion(dbQuestion: any): ActiveQuestion | null {
  if (!dbQuestion) return null;
  
  try {
    const questionData = typeof dbQuestion.question_data === 'string' 
      ? JSON.parse(dbQuestion.question_data)
      : dbQuestion.question_data;

    return {
      id: dbQuestion.id,
      question_key: dbQuestion.question_key,
      question_data: {
        type: questionData.type,
        choices: questionData.choices,
        ...questionData
      },
      title: dbQuestion.title || questionData.title || "Untitled Question",
      session_id: dbQuestion.session_id,
      status: dbQuestion.status,
      display_order: dbQuestion.display_order
    };
  } catch (error) {
    console.error("Error converting question data:", error);
    return null;
  }
}

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
          const convertedQuestion = convertToActiveQuestion(payload.new);
          
          switch (payload.eventType) {
            case "UPDATE":
              if (convertedQuestion?.status === "active") {
                onQuestionUpdate(convertedQuestion);
                onResponsesUpdate([]); // Reset responses for new question
              } else if (
                payload.new.status === "completed" &&
                activeQuestion?.id === payload.new.id
              ) {
                onQuestionUpdate(null);
              }
              break;

            case "INSERT":
              if (convertedQuestion?.status === "active") {
                onQuestionUpdate(convertedQuestion);
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
