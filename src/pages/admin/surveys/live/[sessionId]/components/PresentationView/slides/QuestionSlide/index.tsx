
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { LiveSessionQuestion } from "../../charts/types";
import { QuestionHeader } from "./components/QuestionHeader";
import { ResponseVisualization } from "./components/ResponseVisualization";
import { useQuestionStatus } from "./hooks/useQuestionStatus";

interface QuestionSlideProps {
  question: LiveSessionQuestion | null;
  responses: any[];
  isActive: boolean;
  isSessionActive: boolean;
}

export function QuestionSlide({ 
  question, 
  responses, 
  isActive, 
  isSessionActive 
}: QuestionSlideProps) {
  const { isEnabling, handleEnableQuestion } = useQuestionStatus(question);

  return (
    <div className={`slide ${isActive ? 'active' : ''}`}>
      {question ? (
        <div className="flex flex-col h-full">
          <Card className="p-6 flex-1">
            <div className="space-y-4">
              <QuestionHeader
                question={question}
                isSessionActive={isSessionActive}
                isEnabling={isEnabling}
                onEnable={handleEnableQuestion}
              />
              
              {typeof question.question_data.description === 'string' && (
                <p className="text-muted-foreground">
                  {question.question_data.description}
                </p>
              )}
              
              <div className="mt-8">
                <ResponseVisualization
                  question={question}
                  responses={responses}
                />
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <Alert className="max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Question Available</AlertTitle>
            <AlertDescription>
              Enable a question from the Question Manager to start collecting responses.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
