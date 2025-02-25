
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResponseInput } from "./components/ResponseInput";
import { useLiveSession } from "./hooks/useLiveSession";

export default function PublicLiveSession() {
  const { joinCode } = useParams();
  const [response, setResponse] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    isLoading,
    activeQuestion,
    participantInfo,
    submitResponse
  } = useLiveSession(joinCode!);

  const handleSubmitResponse = async () => {
    if (!response.trim()) return;
    
    setIsSubmitting(true);
    const success = await submitResponse(response);
    if (success) {
      setResponse("");
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 text-sm text-muted-foreground">
            Joined as: {participantInfo?.displayName}
          </div>

          {activeQuestion ? (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">{activeQuestion.question_data.title}</h2>
              
              <div className="space-y-4">
                <ResponseInput
                  question={activeQuestion}
                  value={response}
                  onChange={setResponse}
                  isDisabled={isSubmitting}
                />

                <Button
                  onClick={handleSubmitResponse}
                  disabled={!response.trim() || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Submitting..." : "Submit Response"}
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Waiting for the next question...</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
