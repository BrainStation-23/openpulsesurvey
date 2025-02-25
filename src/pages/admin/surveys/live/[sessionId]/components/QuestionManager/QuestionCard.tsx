
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LiveSessionQuestion, SessionStatus } from "../../../types";
import { ArrowUp, ArrowDown, PlayCircle, StopCircle, CheckCircle } from "lucide-react";

interface QuestionCardProps {
  question: LiveSessionQuestion;
  onStatusChange: (questionId: string, status: "pending" | "active" | "completed") => Promise<void>;
  onReorder: (questionId: string, newOrder: number) => Promise<void>;
  sessionStatus: SessionStatus;
}

export function QuestionCard({ 
  question, 
  onStatusChange, 
  onReorder,
  sessionStatus 
}: QuestionCardProps) {
  const isSessionActive = sessionStatus === "active";
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-gray-500";
      case "active":
        return "text-green-500";
      case "completed":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${getStatusColor(question.status)}`}>
              #{question.display_order}
            </span>
            <h3 className="font-medium">{question.question_data.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Type: {question.question_data.type}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Reorder buttons */}
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReorder(question.id, question.display_order - 1)}
              disabled={question.display_order <= 1}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReorder(question.id, question.display_order + 1)}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Status control buttons */}
          {question.status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(question.id, "active")}
              disabled={!isSessionActive}
              className="gap-2"
            >
              <PlayCircle className="h-4 w-4" />
              Enable
            </Button>
          )}
          
          {question.status === "active" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(question.id, "completed")}
              disabled={!isSessionActive}
              className="gap-2"
            >
              <StopCircle className="h-4 w-4" />
              Complete
            </Button>
          )}
          
          {question.status === "completed" && (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              Completed
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
