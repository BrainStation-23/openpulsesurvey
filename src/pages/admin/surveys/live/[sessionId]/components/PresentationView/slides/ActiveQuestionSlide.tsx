import { LiveSessionQuestion } from "../../../../types";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ActiveQuestionSlideProps {
  currentActiveQuestion: LiveSessionQuestion | null;
  responses: any[];
  isActive: boolean;
}

export function ActiveQuestionSlide({ currentActiveQuestion, responses, isActive }: ActiveQuestionSlideProps) {
  const pendingQuestionsCount = currentActiveQuestion === null ? 0 : 1;

  return (
    <div className={`slide ${isActive ? 'active' : ''}`}>
      {currentActiveQuestion ? (
        <div className="flex flex-col h-full">
          <Card className="p-6 flex-1">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                {currentActiveQuestion.question_data.title}
              </h2>
              {typeof currentActiveQuestion.question_data.description === 'string' && (
                <p className="text-muted-foreground">
                  {currentActiveQuestion.question_data.description}
                </p>
              )}
              
              <div className="mt-8">
                {/* Placeholder for response visualization */}
                <div className="text-center text-muted-foreground">
                  {responses.length} responses received
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <Alert className="max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Active Question</AlertTitle>
            <AlertDescription>
              Enable a question from the Question Manager to start collecting responses.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
