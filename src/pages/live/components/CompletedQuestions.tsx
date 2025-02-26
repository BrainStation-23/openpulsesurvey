
import { Card } from "@/components/ui/card";
import { CompletedQuestion } from "../types/completed-questions";
import { ResponseVisualization } from "../../admin/surveys/live/[sessionId]/components/PresentationView/slides/QuestionSlide/components/ResponseVisualization";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CompletedQuestionsProps {
  questions: CompletedQuestion[];
}

export function CompletedQuestions({ questions }: CompletedQuestionsProps) {
  if (!questions.length) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Previous Questions</h3>
      <Accordion type="single" collapsible className="space-y-4">
        {questions.map((question) => (
          <AccordionItem 
            key={question.id} 
            value={question.id}
            className="border rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
              <div className="flex items-center justify-between w-full">
                <span className="text-left font-medium">
                  {question.question_data.title}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(question.completedAt).toLocaleTimeString()}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-6 bg-card">
                <ResponseVisualization
                  question={question}
                  responses={question.responses}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
