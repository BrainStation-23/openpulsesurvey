
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { LiveSessionQuestion } from "../../../../types";

export function useLiveResponses(sessionId: string) {
  const [responses, setResponses] = useState<any[]>([]);
  const [participants, setParticipants] = useState<number>(0);
  const [activeQuestions, setActiveQuestions] = useState<LiveSessionQuestion[]>([]);

  useEffect(() => {
    // Initial fetch of responses
    const fetchInitialData = async () => {
      // Fetch responses
      const { data: responseData } = await supabase
        .from('live_session_responses')
        .select('*')
        .eq('session_id', sessionId);
        
      if (responseData) {
        setResponses(responseData);
      }

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
        setActiveQuestions(questionData);
      }
    };

    fetchInitialData();

    // Subscribe to new responses
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
        (payload) => {
          if (payload.eventType === 'INSERT') {
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
        async () => {
          // Refetch questions on any change
          const { data: questionData } = await supabase
            .from('live_session_questions')
            .select('*')
            .eq('session_id', sessionId)
            .order('display_order', { ascending: true });

          if (questionData) {
            setActiveQuestions(questionData);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { responses, participants, activeQuestions };
}
