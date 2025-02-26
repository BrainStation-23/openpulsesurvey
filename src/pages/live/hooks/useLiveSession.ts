
import { useResponseSubmission } from "./useResponseSubmission";
import { useSessionSubscription } from "./useSessionSubscription";
import { useParticipantManagement } from "./useParticipantManagement";
import { useQuestionManagement } from "./useQuestionManagement";
import { useSessionSetup } from "./useSessionSetup";

export interface LobbyParticipant {
  participant_id: string;
  display_name: string;
  joined_at: string;
}

export function useLiveSession(joinCode: string) {
  const { isLoading, sessionId } = useSessionSetup(joinCode);
  const { participantInfo, participants } = useParticipantManagement(joinCode, sessionId);
  const {
    activeQuestion,
    setActiveQuestion,
    questionResponses,
    setQuestionResponses,
    hasSubmitted,
    setHasSubmitted,
    completedQuestions
  } = useQuestionManagement(sessionId, participantInfo);

  const { submitResponse: submitResponseBase } = useResponseSubmission(sessionId);

  useSessionSubscription(
    sessionId,
    activeQuestion,
    setActiveQuestion,
    setQuestionResponses
  );

  const submitResponse = async (response: string) => {
    if (!activeQuestion || !participantInfo) return false;
    const success = await submitResponseBase(response, activeQuestion, participantInfo);
    if (success) {
      setHasSubmitted(true);
    }
    return success;
  };

  return {
    isLoading,
    sessionId,
    activeQuestion,
    participantInfo,
    questionResponses,
    participants,
    submitResponse,
    hasSubmitted,
    completedQuestions
  };
}
