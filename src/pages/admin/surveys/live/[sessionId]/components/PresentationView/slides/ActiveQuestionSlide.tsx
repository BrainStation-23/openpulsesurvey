
import { LiveSessionQuestion } from "../../../../types";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ActiveQuestionSlideProps {
  questions: LiveSessionQuestion[];
  responses: any[];
  isActive: boolean;
}

export function ActiveQuestionSlide({ questions, responses, isActive }: ActiveQuestionSlideProps) {
  // Find the first active question
  const activeQuestion = questions.find(q => q.status === 'active');
  const pendingQuestions = questions.filter(q => q.status === 'pending');

  return (
    <div className={`slide ${isActive ? 'active' : ''}`}>
      {activeQuestion ? (
        <div className="flex flex-col h-full">
          <Card className="p-6 flex-1">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                {activeQuestion.question_data.title}
              </h2>
              {typeof activeQuestion.question_data.description === 'string' && (
                <p className="text-muted-foreground">
                  {activeQuestion.question_data.description}
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
      ) : pendingQuestions.length > 0 ? (
        <div className="flex items-center justify-center h-full">
          <Alert className="max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Active Question</AlertTitle>
            <AlertDescription>
              There are {pendingQuestions.length} pending questions. Enable a question from the Question Manager to start collecting responses.
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <Alert className="max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Questions Available</AlertTitle>
            <AlertDescription>
              No questions have been set up for this session. Add questions in the Question Manager to begin.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
