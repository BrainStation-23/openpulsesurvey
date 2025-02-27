
import { Card } from "@/components/ui/card";
import { CompletedQuestion } from "../types/completed-questions";
import { ResponseVisualization } from "../../admin/surveys/live/[sessionId]/components/PresentationView/slides/QuestionSlide/components/ResponseVisualization";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CompletedQuestionsProps {
  questions: CompletedQuestion[];
}

export function CompletedQuestions({ questions }: CompletedQuestionsProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<CompletedQuestion | null>(null);
  const [completedQuestionsWithResponses, setCompletedQuestionsWithResponses] = useState<CompletedQuestion[]>([]);

  useEffect(() => {
    const fetchQuestionsWithResponses = async () => {
      try {
        const questionsWithResponses = await Promise.all(
          questions.map(async (question) => {
            const { data: responses, error } = await supabase
              .from("live_session_responses")
              .select("*")
              .eq("session_id", question.session_id)
              .eq("question_key", question.question_key);

            if (error) {
              console.error("Error fetching responses:", error);
              return {
                ...question,
                responses: []
              };
            }

            return {
              ...question,
              responses: responses || []
            };
          })
        );

        setCompletedQuestionsWithResponses(questionsWithResponses);
      } catch (error) {
        console.error("Error processing questions:", error);
      }
    };

    if (questions.length > 0) {
      fetchQuestionsWithResponses();
    }
  }, [questions]);

  if (!questions.length) {
    console.log('CompletedQuestions - No questions available');
    return null;
  }

  return (
    <>
      <div className="fixed bottom-[60px] left-0 right-0 border-t bg-background">
        <div className="container mx-auto px-4">
          <div className="py-2">
            <p className="text-sm font-medium text-muted-foreground mb-2">Previous Questions</p>
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {completedQuestionsWithResponses.map((question) => (
                  <button
                    key={question.id}
                    onClick={() => setSelectedQuestion(question)}
                    className="shrink-0 px-4 py-2 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                  >
                    <span className="text-sm font-medium">
                      {question.question_data.title}
                    </span>
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedQuestion?.question_data.title}</DialogTitle>
          </DialogHeader>
          
          {selectedQuestion && (
            <div className="mt-4">
              <ResponseVisualization
                question={selectedQuestion}
                responses={selectedQuestion.responses}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
