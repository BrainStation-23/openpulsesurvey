
import { LiveSessionQuestion } from "../../../charts/types";

interface QuestionHeaderProps {
  question: LiveSessionQuestion;
}

export function QuestionHeader({ question }: QuestionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold">
          {question.question_data.title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Status: {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
        </p>
      </div>
    </div>
  );
}
