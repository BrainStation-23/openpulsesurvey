
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

interface CompletedQuestionsProps {
  questions: CompletedQuestion[];
}

export function CompletedQuestions({ questions }: CompletedQuestionsProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<CompletedQuestion | null>(null);

  useEffect(() => {
    console.log('CompletedQuestions - questions received:', questions);
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
                {questions.map((question) => (
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
