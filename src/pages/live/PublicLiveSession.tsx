
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResponseInput } from "./components/ResponseInput";
import { Lobby } from "./components/Lobby";
import { useLiveSession } from "./hooks/useLiveSession";
import { ResponseVisualization } from "../admin/surveys/live/[sessionId]/components/PresentationView/slides/QuestionSlide/components/ResponseVisualization";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export default function PublicLiveSession() {
  const { joinCode } = useParams();
  const [response, setResponse] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { theme, setTheme } = useTheme();
  
  const {
    isLoading,
    activeQuestion,
    participantInfo,
    submitResponse,
    questionResponses,
    participants
  } = useLiveSession(joinCode!);

  const handleSubmitResponse = async () => {
    if (!response.trim() || hasSubmitted) return;
    
    setIsSubmitting(true);
    const success = await submitResponse(response);
    if (success) {
      setResponse("");
      setHasSubmitted(true);
    }
    setIsSubmitting(false);
  };

  // Reset submission state when question changes
  useEffect(() => {
    setHasSubmitted(false);
    setResponse("");
  }, [activeQuestion?.id]);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Live Session</h1>
            <div className="px-3 py-1 bg-primary-foreground/10 rounded-md">
              Code: {joinCode}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm">
              Joined as: {participantInfo?.displayName}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary-foreground/10"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? (
                <MoonIcon className="h-5 w-5" />
              ) : (
                <SunIcon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-6">
            {activeQuestion ? (
              <Card className="overflow-hidden">
                <div className="p-6 space-y-6">
                  <h2 className="text-xl font-semibold">
                    {activeQuestion.question_data.title}
                  </h2>
                  
                  <div className="space-y-6">
                    {hasSubmitted ? (
                      <div className="space-y-6">
                        <div className="text-center animate-fade-in">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                            <svg
                              className="w-6 h-6 text-green-600 dark:text-green-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <p className="text-green-600 dark:text-green-400 font-medium mb-4">
                            Response submitted successfully!
                          </p>
                          <p className="text-muted-foreground">
                            Waiting for other participants...
                          </p>
                        </div>
                        
                        <div className="border-t pt-6">
                          <h3 className="text-lg font-medium mb-4">Current Results</h3>
                          <ResponseVisualization
                            question={activeQuestion}
                            responses={questionResponses}
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <ResponseInput
                          question={activeQuestion}
                          value={response}
                          onChange={setResponse}
                          isDisabled={isSubmitting}
                        />

                        <Button
                          onClick={handleSubmitResponse}
                          disabled={!response.trim() || isSubmitting || hasSubmitted}
                          className="w-full"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Response"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
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
          
          {/* Lobby Sidebar */}
          <div className="md:block">
            <Lobby 
              participants={participants} 
              questionResponses={questionResponses}
              activeQuestionKey={activeQuestion?.question_key}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-auto py-4">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Survey System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
