
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Lobby } from "./components/Lobby";
import { CompletedQuestions } from "./components/CompletedQuestions";
import { useLiveSession } from "./hooks/useLiveSession";
import { SessionValidation } from "./components/SessionValidation";
import { SessionHeader } from "./components/SessionHeader";
import { ActiveQuestionCard } from "./components/ActiveQuestionCard";

export default function PublicLiveSession() {
  const { joinCode } = useParams();
  const [response, setResponse] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  
  const {
    isLoading,
    activeQuestion,
    participantInfo,
    submitResponse,
    questionResponses,
    participants,
    hasSubmitted,
    completedQuestions
  } = useLiveSession(joinCode!);

  const handleSubmitResponse = async () => {
    if (!response.trim() || hasSubmitted) return;
    
    setIsSubmitting(true);
    const success = await submitResponse(response);
    if (success) {
      setResponse("");
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    setResponse("");
  }, [activeQuestion?.id]);

  if (isValidating) {
    return <SessionValidation joinCode={joinCode} setIsValidating={setIsValidating} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SessionHeader joinCode={joinCode} participantInfo={participantInfo} />

      <div className="flex-1 flex">
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            {activeQuestion ? (
              <ActiveQuestionCard
                activeQuestion={activeQuestion}
                response={response}
                setResponse={setResponse}
                isSubmitting={isSubmitting}
                hasSubmitted={hasSubmitted}
                questionResponses={questionResponses}
                handleSubmitResponse={handleSubmitResponse}
              />
            ) : (
              <Card className="p-6">
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Waiting for the next question...
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The presenter will start the next question shortly.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="w-[300px] border-l shrink-0 hidden md:block">
          <div className="h-full overflow-y-auto">
            <Lobby 
              participants={participants} 
              questionResponses={questionResponses}
              activeQuestionKey={activeQuestion?.question_key}
            />
          </div>
        </div>
      </div>

      <CompletedQuestions questions={completedQuestions} />

      <footer className="border-t py-4 bg-background shrink-0">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Survey System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
