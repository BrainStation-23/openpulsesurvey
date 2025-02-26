
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ActiveQuestion, ParticipantInfo } from "../types";
import { useResponseSubmission } from "./useResponseSubmission";
import { useSessionSubscription } from "./useSessionSubscription";

export interface LobbyParticipant {
  participant_id: string;
  display_name: string;
  joined_at: string;
}

export function useLiveSession(joinCode: string) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestion | null>(null);
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo | null>(null);
  const [questionResponses, setQuestionResponses] = useState<any[]>([]);
  const [participants, setParticipants] = useState<LobbyParticipant[]>([]);

  const { submitResponse: submitResponseBase } = useResponseSubmission(sessionId);

  useEffect(() => {
    const storedInfo = localStorage.getItem(`live_session_${joinCode}`);
    if (!storedInfo) {
      navigate(`/live/${joinCode}/join`);
      return;
    }
    setParticipantInfo(JSON.parse(storedInfo));
  }, [joinCode, navigate]);

  const handleQuestionUpdate = useCallback((question: ActiveQuestion) => {
    setActiveQuestion(question);
  }, []);

  const handleResponsesUpdate = useCallback((responses: any[]) => {
    setQuestionResponses(responses);
  }, []);

  useSessionSubscription(
    sessionId,
    activeQuestion,
    handleQuestionUpdate,
    handleResponsesUpdate
  );

  // Set up presence subscription
  useEffect(() => {
    if (!sessionId || !participantInfo) return;

    const channel = supabase.channel(`presence_${sessionId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as Record<string, LobbyParticipant[]>;
        const allParticipants = Object.values(state).flat();
        setParticipants(allParticipants);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        toast({
          description: `${newPresences[0].display_name} joined the session`,
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            participant_id: participantInfo.participantId,
            display_name: participantInfo.displayName,
            joined_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, participantInfo, toast]);

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

  const submitResponse = async (response: string) => {
    return submitResponseBase(response, activeQuestion, participantInfo);
  };

  return {
    isLoading,
    sessionId,
    activeQuestion,
    participantInfo,
    questionResponses,
    participants,
    submitResponse
  };
}
