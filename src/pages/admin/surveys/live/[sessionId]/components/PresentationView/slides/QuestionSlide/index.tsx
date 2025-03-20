
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, PlayCircle, StopCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { LiveSessionQuestion } from "../../charts/types";
import { QuestionHeader } from "./components/QuestionHeader";
import { ResponseVisualization } from "./components/ResponseVisualization";
import { useQuestionActions } from "../../../../hooks/useQuestionActions";
import { useEffect } from "react";

interface QuestionSlideProps {
  question: LiveSessionQuestion | null;
  responses: any[];
  isActive: boolean;
  isSessionActive: boolean;
  allowStatusChange: boolean;
}

export function QuestionSlide({ 
  question, 
  responses, 
  isActive, 
  isSessionActive,
  allowStatusChange
}: QuestionSlideProps) {
  const { updateQuestionStatus, isUpdating } = useQuestionActions(question?.session_id || '');

  // Debug logging for props and state
  useEffect(() => {
    if (isActive) {
      console.log('QuestionSlide active:', {
        questionId: question?.id,
        isActive,
        isSessionActive,
        allowStatusChange,
        status: question?.status
      });
    }
  }, [isActive, isSessionActive, allowStatusChange, question]);

  const handleStatusChange = async (newStatus: "active" | "completed") => {
    if (!question || !allowStatusChange) {
      console.log('Status change blocked:', {
        hasQuestion: !!question,
        allowStatusChange,
      });
      return;
    }
    
    console.log('Updating question status:', {
      questionId: question.id,
      newStatus,
    });
    
    await updateQuestionStatus(question.id, newStatus);
  };

  return (
    <div className={`slide ${isActive ? 'active' : ''}`}>
      {question ? (
        <div className="flex flex-col h-full">
          <Card className="p-6 flex flex-col justify-between h-full">
            <div className="space-y-4 flex-1">
              <div className="flex items-start justify-between">
                <QuestionHeader question={question} />
                
                {isSessionActive && allowStatusChange && (
                  <div className="flex items-center gap-2">
                    {question.status === "pending" && (
                      <Button
                        onClick={() => handleStatusChange("active")}
                        disabled={isUpdating}
                        className="gap-2"
                      >
                        <PlayCircle className="h-4 w-4" />
                        Enable Question
                      </Button>
                    )}
                    
                    {question.status === "active" && (
                      <Button
                        onClick={() => handleStatusChange("completed")}
                        disabled={isUpdating}
                        className="gap-2"
                      >
                        <StopCircle className="h-4 w-4" />
                        Complete
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
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
