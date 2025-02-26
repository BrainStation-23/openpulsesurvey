
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ActiveQuestion, ParticipantInfo } from "../types";

export function useResponseSubmission(sessionId: string | null) {
  const { toast } = useToast();

  const submitResponse = async (
    response: string,
    activeQuestion: ActiveQuestion | null,
    participantInfo: ParticipantInfo | null
  ) => {
    if (!activeQuestion || !participantInfo || !response.trim()) return false;

    try {
      // Using simple equality check with the simplified question_key
      const { data: existingResponse } = await supabase
        .from("live_session_responses")
        .select("id")
        .eq("session_id", sessionId)
        .eq("participant_id", participantInfo.participantId)
        .eq("question_key", activeQuestion.question_key)
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

  return { submitResponse };
}
