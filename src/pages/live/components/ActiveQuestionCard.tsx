
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponseInput } from "./ResponseInput";
import { ActiveQuestion } from "../types";
import { ResponseVisualization } from "../../admin/surveys/live/[sessionId]/components/PresentationView/slides/QuestionSlide/components/ResponseVisualization";

interface ActiveQuestionCardProps {
  activeQuestion: ActiveQuestion;
  response: string;
  setResponse: (value: string) => void;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  questionResponses: any[];
  handleSubmitResponse: () => Promise<void>;
}

export function ActiveQuestionCard({
  activeQuestion,
  response,
  setResponse,
  isSubmitting,
  hasSubmitted,
  questionResponses,
  handleSubmitResponse
}: ActiveQuestionCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-semibold">
          {activeQuestion.title}
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
  );
}
