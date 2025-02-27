
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { LiveSessionQuestion, QuestionData } from "../../../../types";

export function useLiveResponses(sessionId: string) {
  const [responsesMap, setResponsesMap] = useState<Record<string, any[]>>({});
  const [participants, setParticipants] = useState<number>(0);
  const [activeQuestions, setActiveQuestions] = useState<LiveSessionQuestion[]>([]);
  const [currentActiveQuestion, setCurrentActiveQuestion] = useState<LiveSessionQuestion | null>(null);

  const transformQuestionData = (rawQuestion: any): LiveSessionQuestion => {
    const questionData: QuestionData = {
      title: rawQuestion.question_data.title || "Untitled Question",
      type: rawQuestion.question_data.type || "unknown",
      ...rawQuestion.question_data
    };

    return {
      ...rawQuestion,
      question_data: questionData,
      status: rawQuestion.status as "pending" | "active" | "completed"
    };
  };

  // Fetch responses for all questions
  const fetchAllResponses = async () => {
    const { data: responseData } = await supabase
      .from('live_session_responses')
      .select('*')
      .eq('session_id', sessionId);
      
    if (responseData) {
      // Group responses by question key
      const groupedResponses = responseData.reduce((acc: Record<string, any[]>, response) => {
        const key = response.question_key;
        if (!acc[key]) acc[key] = [];
        acc[key].push(response);
        return acc;
      }, {});
      
      setResponsesMap(groupedResponses);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      // Get participant count
      const { count } = await supabase
        .from('live_session_participants')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('status', 'connected');
        
      setParticipants(count || 0);

      // Fetch questions
      const { data: questionData } = await supabase
        .from('live_session_questions')
        .select('*')
        .eq('session_id', sessionId)
        .order('display_order', { ascending: true });

      if (questionData) {
        const transformedQuestions = questionData.map(transformQuestionData);
        setActiveQuestions(transformedQuestions);
        
        const activeQuestion = transformedQuestions.find(q => q.status === 'active');
        setCurrentActiveQuestion(activeQuestion || null);
      }

      // Fetch all responses
      await fetchAllResponses();
    };

    fetchInitialData();

    // Subscribe to changes
    const channel = supabase
      .channel(`room:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_session_responses',
          filter: `session_id=eq.${sessionId}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const response = payload.new;
            setResponsesMap(current => ({
              ...current,
              [response.question_key]: [
                ...(current[response.question_key] || []),
                response
              ]
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_session_participants',
          filter: `session_id=eq.${sessionId}`
        },
        async () => {
          const { count } = await supabase
            .from('live_session_participants')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', sessionId)
            .eq('status', 'connected');
            
          setParticipants(count || 0);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_session_questions',
          filter: `session_id=eq.${sessionId}`
        },
        async (payload) => {
          const { data: questionData } = await supabase
            .from('live_session_questions')
            .select('*')
            .eq('session_id', sessionId)
            .order('display_order', { ascending: true });

          if (questionData) {
            const transformedQuestions = questionData.map(transformQuestionData);
            setActiveQuestions(transformedQuestions);

            if (payload.eventType === 'UPDATE') {
              const activeQuestion = transformedQuestions.find(q => q.status === 'active');
              setCurrentActiveQuestion(activeQuestion || null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { 
    getQuestionResponses: (questionKey: string) => responsesMap[questionKey] || [],
    participants, 
    activeQuestions, 
    currentActiveQuestion 
  };
}
