
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LiveSessionQuestion } from "../../types";

export function useQuestionActions(sessionId: string) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateQuestionStatus = async (
    questionId: string, 
    newStatus: "pending" | "active" | "completed"
  ) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("live_session_questions")
        .update({
          status: newStatus,
          enabled_at: newStatus === "active" ? new Date().toISOString() : null,
          disabled_at: newStatus === "completed" ? new Date().toISOString() : null
        })
        .eq("id", questionId);

      if (error) throw error;

      toast({
        title: "Question updated",
        description: `Question is now ${newStatus}`,
      });

    } catch (error) {
      console.error("Error updating question:", error);
      toast({
        title: "Error",
        description: "Failed to update question status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateQuestionStatus,
    isUpdating
  };
}
