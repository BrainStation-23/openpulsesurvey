
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveSessionQuestion } from "../../../charts/types";

interface QuestionHeaderProps {
  question: LiveSessionQuestion;
  isSessionActive: boolean;
  isEnabling: boolean;
  onEnable: () => void;
}

export function QuestionHeader({ question, isSessionActive, isEnabling, onEnable }: QuestionHeaderProps) {
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
      {question.status === "pending" && (
        <Button
          onClick={onEnable}
          disabled={!isSessionActive || isEnabling}
          className="gap-2"
        >
          <PlayCircle className="h-4 w-4" />
          {isEnabling ? "Enabling..." : "Enable Question"}
        </Button>
      )}
    </div>
  );
}
