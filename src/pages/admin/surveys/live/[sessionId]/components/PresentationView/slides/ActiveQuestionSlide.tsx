
import { LiveSessionQuestion } from "../../../../types";
import { Card } from "@/components/ui/card";

interface ActiveQuestionSlideProps {
  questions: LiveSessionQuestion[];
  responses: any[];
  isActive: boolean;
}

export function ActiveQuestionSlide({ questions, responses, isActive }: ActiveQuestionSlideProps) {
  const activeQuestion = questions[0]; // For now, just show the first active question

  return (
    <div className={`slide ${isActive ? 'active' : ''}`}>
      {activeQuestion ? (
        <div className="flex flex-col h-full">
          <Card className="p-6 flex-1">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">{activeQuestion.title}</h2>
              {activeQuestion.description && (
                <p className="text-muted-foreground">{activeQuestion.description}</p>
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
          <p className="text-muted-foreground">No active questions</p>
        </div>
      )}
    </div>
  );
}
