
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ActiveQuestion, ParticipantInfo } from "../types";
import { CompletedQuestion } from "../types/completed-questions";
import { convertToActiveQuestion } from "./utils/questionConverter";

export function useQuestionManagement(
  sessionId: string | null, 
  participantInfo: ParticipantInfo | null
) {
  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestion | null>(null);
  const [questionResponses, setQuestionResponses] = useState<any[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<CompletedQuestion[]>([]);

  const fetchCompletedQuestions = useCallback(async () => {
    if (!sessionId || !participantInfo) return;

    const { data: questions, error } = await supabase
      .from("live_session_questions")
      .select(`
        *,
        responses:live_session_responses(*)
      `)
      .eq("session_id", sessionId)
      .eq("status", "completed")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching completed questions:", error);
      return;
    }

    const convertedQuestions: CompletedQuestion[] = questions
      .map(q => {
        const convertedQuestion = convertToActiveQuestion(q);
        if (!convertedQuestion) return null;

        return {
          ...convertedQuestion,
          responses: q.responses || [],
          completedAt: q.disabled_at || q.updated_at
        };
      })
      .filter((q): q is CompletedQuestion => q !== null);

    setCompletedQuestions(convertedQuestions);
  }, [sessionId, participantInfo]);

  useEffect(() => {
    fetchCompletedQuestions();
  }, [fetchCompletedQuestions]);

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`questions_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_session_questions',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          if (payload.new.status === 'completed') {
            fetchCompletedQuestions();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, fetchCompletedQuestions]);

  useEffect(() => {
    const checkExistingResponse = async () => {
      if (!sessionId || !activeQuestion || !participantInfo) return;

      const { data: existingResponse } = await supabase
        .from("live_session_responses")
        .select("id")
        .match({
          session_id: sessionId,
          participant_id: participantInfo.participantId,
          question_key: activeQuestion.question_key
        })
        .single();

      if (existingResponse) {
        setHasSubmitted(true);
      }
    };

    checkExistingResponse();
  }, [sessionId, activeQuestion, participantInfo]);

  return {
    activeQuestion,
    setActiveQuestion,
    questionResponses,
    setQuestionResponses,
    hasSubmitted,
    setHasSubmitted,
    completedQuestions
  };
}
