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
  const { theme, setTheme } = useTheme();
  
  const {
    isLoading,
    activeQuestion,
    participantInfo,
    submitResponse,
    questionResponses,
    participants,
    hasSubmitted
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

  // Reset response when question changes
  useEffect(() => {
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
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b bg-primary text-primary-foreground shrink-0">
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

      <div className="flex-1 flex">
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
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
