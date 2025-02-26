
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { LiveSessionQuestion } from "../../../charts/types";

export function useQuestionStatus(question: LiveSessionQuestion | null) {
  const { toast } = useToast();
  const [isEnabling, setIsEnabling] = useState(false);

  const handleEnableQuestion = async () => {
    if (!question) return;
    
    setIsEnabling(true);
    try {
      // First mark any currently active questions as completed
      const { error: completionError } = await supabase
        .from("live_session_questions")
        .update({
          status: "completed",
          disabled_at: new Date().toISOString()
        })
        .eq("session_id", question.session_id)
        .eq("status", "active");

      if (completionError) throw completionError;

      // Enable this specific question
      const { error: activationError } = await supabase
        .from("live_session_questions")
        .update({
          status: "active",
          enabled_at: new Date().toISOString()
        })
        .eq("id", question.id);

      if (activationError) throw activationError;

      toast({
        title: "Question enabled",
        description: `Question "${question.question_data.title}" is now active`,
      });
    } catch (error) {
      console.error("Error enabling question:", error);
      toast({
        title: "Error",
        description: "Failed to enable question",
        variant: "destructive",
      });
    } finally {
      setIsEnabling(false);
    }
  };

  useEffect(() => {
    if (!question) return;

    const channel = supabase
      .channel(`question_status_${question.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_session_questions',
          filter: `id=eq.${question.id}`
        },
        (payload) => {
          console.log('Question status update:', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [question?.id]);

  return {
    isEnabling,
    handleEnableQuestion
  };
}
