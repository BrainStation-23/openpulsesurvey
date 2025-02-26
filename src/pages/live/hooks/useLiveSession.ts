
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ActiveQuestion, ParticipantInfo } from "../types";

export function useLiveSession(joinCode: string) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestion | null>(null);
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo | null>(null);
  const [questionResponses, setQuestionResponses] = useState<any[]>([]);

  useEffect(() => {
    const storedInfo = localStorage.getItem(`live_session_${joinCode}`);
    if (!storedInfo) {
      navigate(`/live/${joinCode}/join`);
      return;
    }
    setParticipantInfo(JSON.parse(storedInfo));
  }, [joinCode, navigate]);

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

        const { data: questions, error: questionError } = await supabase
          .from("live_session_questions")
          .select("*")
          .eq("session_id", session.id)
          .eq("status", "active")
          .single();

        if (!questionError && questions) {
          const questionData = questions.question_data as {
            title: string;
            type: string;
            choices?: { text: string; value: string; }[];
          };

          setActiveQuestion({
            id: questions.id,
            question_key: questions.question_key,
            question_data: questionData,
            session_id: session.id,
            status: questions.status,
            display_order: questions.display_order
          });

          // Fetch responses for the active question
          const { data: responses } = await supabase
            .from("live_session_responses")
            .select("*")
            .eq("session_id", session.id)
            .eq("question_key", questions.question_key);

          setQuestionResponses(responses || []);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Unable to join session",
          variant: "destructive",
        });
        navigate("/live");
      } finally {
        setIsLoading(false);
      }
    };

    setupSession();
  }, [joinCode, toast, navigate]);

  useEffect(() => {
    if (!sessionId || !activeQuestion) return;

    const channel = supabase
      .channel(`session_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_session_questions",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload: any) => {
          if (payload.new && payload.new.status === "active") {
            const questionData = payload.new.question_data as {
              title: string;
              type: string;
              choices?: { text: string; value: string; }[];
            };

            setActiveQuestion({
              id: payload.new.id,
              question_key: payload.new.question_key,
              question_data: questionData,
              session_id: sessionId,
              status: payload.new.status,
              display_order: payload.new.display_order
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_session_responses",
          filter: `session_id=eq.${sessionId} AND question_key=eq.${activeQuestion.question_key}`,
        },
        async () => {
          // Refresh responses when new ones come in
          const { data: responses } = await supabase
            .from("live_session_responses")
            .select("*")
            .eq("session_id", sessionId)
            .eq("question_key", activeQuestion.question_key);
            
          setQuestionResponses(responses || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, activeQuestion]);

  const submitResponse = async (response: string) => {
    if (!activeQuestion || !participantInfo || !response.trim()) return false;

    try {
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
        toast({
          title: "Error",
          description: "You have already submitted a response for this question.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from("live_session_responses")
        .insert({
          session_id: sessionId,
          participant_id: participantInfo.participantId,
          question_key: activeQuestion.question_key,
          response_data: { response }
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Error",
            description: "You have already submitted a response for this question.",
            variant: "destructive",
          });
          return false;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Your response has been submitted",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit response",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    isLoading,
    sessionId,
    activeQuestion,
    participantInfo,
    questionResponses,
    submitResponse
  };
}
