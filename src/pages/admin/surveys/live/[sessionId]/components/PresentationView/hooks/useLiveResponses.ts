
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { LiveSessionQuestion, QuestionData } from "../../../../types";

export function useLiveResponses(sessionId: string) {
  const [responses, setResponses] = useState<any[]>([]);
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

  // Fetch responses for the current active question
  const fetchResponsesForQuestion = async (questionKey: string) => {
    const { data: responseData } = await supabase
      .from('live_session_responses')
      .select('*')
      .eq('session_id', sessionId)
      .eq('question_key', questionKey);
      
    if (responseData) {
      setResponses(responseData);
    }
  };

  useEffect(() => {
    // Initial fetch of data
    const fetchInitialData = async () => {
      // Get participant count
      const { count } = await supabase
        .from('live_session_participants')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('status', 'connected');
        
      setParticipants(count || 0);

      // Fetch active questions
      const { data: questionData } = await supabase
        .from('live_session_questions')
        .select('*')
        .eq('session_id', sessionId)
        .order('display_order', { ascending: true });

      if (questionData) {
        const transformedQuestions = questionData.map(transformQuestionData);
        setActiveQuestions(transformedQuestions);
        
        // Set current active question and fetch its responses
        const activeQuestion = transformedQuestions.find(q => q.status === 'active');
        setCurrentActiveQuestion(activeQuestion || null);
        
        if (activeQuestion) {
          await fetchResponsesForQuestion(activeQuestion.question_key);
        }
      }
    };

    fetchInitialData();

    // Subscribe to new responses and question changes
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
          if (payload.eventType === 'INSERT' && 
              currentActiveQuestion?.question_key === payload.new.question_key) {
            setResponses((current) => [...current, payload.new]);
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
          // Update participant count on any change
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
          // Refetch questions on any change
          const { data: questionData } = await supabase
            .from('live_session_questions')
            .select('*')
            .eq('session_id', sessionId)
            .order('display_order', { ascending: true });

          if (questionData) {
            const transformedQuestions = questionData.map(transformQuestionData);
            setActiveQuestions(transformedQuestions);

            // Update current active question if status changed
            if (payload.eventType === 'UPDATE' && payload.new.status === 'active') {
              const newActiveQuestion = transformedQuestions.find(q => q.id === payload.new.id);
              setCurrentActiveQuestion(newActiveQuestion || null);
              
              // Fetch responses for the newly activated question
              if (newActiveQuestion) {
                await fetchResponsesForQuestion(newActiveQuestion.question_key);
              }
            } else if (payload.eventType === 'UPDATE' && payload.old.status === 'active') {
              // If previously active question was completed, find new active question if any
              const activeQuestion = transformedQuestions.find(q => q.status === 'active');
              setCurrentActiveQuestion(activeQuestion || null);
              
              // Fetch responses for the new active question if it exists
              if (activeQuestion) {
                await fetchResponsesForQuestion(activeQuestion.question_key);
              } else {
                setResponses([]); // Clear responses if no active question
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { responses, participants, activeQuestions, currentActiveQuestion };
}
