
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LiveSessionQuestion, SessionStatus } from "../../../types";
import { PlayCircle, StopCircle, CheckCircle, GripVertical, ChevronDown } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface QuestionCardProps {
  question: LiveSessionQuestion;
  onStatusChange: (status: "pending" | "active" | "completed") => Promise<void>;
  onReorder: (questionId: string, newOrder: number) => Promise<void>;
  sessionStatus: SessionStatus;
}

const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "multiple_choice":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "open_text":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "rating":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "boolean":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "border-l-gray-500";
    case "active":
      return "border-l-green-500";
    case "completed":
      return "border-l-blue-500";
    default:
      return "border-l-gray-500";
  }
};

export function QuestionCard({ 
  question, 
  onStatusChange, 
  onReorder,
  sessionStatus 
}: QuestionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isSessionActive = sessionStatus === "active";
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: question.id,
    data: {
      question
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <Card 
        ref={setNodeRef} 
        style={style}
        className={cn(
          "relative border-l-4 hover:shadow-md transition-all",
          getStatusColor(question.status)
        )}
      >
        {/* Ribbon number label */}
        <div className="absolute -left-3 top-4 z-10">
          <div className="bg-primary text-primary-foreground py-1 px-3 text-sm font-semibold shadow-sm" 
               style={{ 
                 clipPath: "polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)" 
               }}>
            #{question.display_order}
          </div>
        </div>

        <div className="p-4 pl-8">
          <div className="flex items-center gap-3">
            {/* Drag handle */}
            <button
              className="touch-none p-2 -m-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </button>

            {/* Title and type */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-medium">{question.question_data.title}</h3>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "font-normal",
                    getTypeColor(question.question_data.type)
                  )}
                >
                  {question.question_data.type}
                </Badge>
              </div>
            </div>

            {/* Status control buttons */}
            <div className="flex items-center gap-2">
              {question.status === "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusChange("active")}
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
                  onClick={() => onStatusChange("completed")}
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

              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isOpen && "transform rotate-180"
                  )} />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </div>

        <CollapsibleContent>
          <div className="px-8 pb-4 border-t pt-4 mt-2 bg-muted/5">
            <div className="space-y-2">
              {question.question_data.description && (
                <p className="text-sm text-muted-foreground">
                  {question.question_data.description}
                </p>
              )}
              <div className="text-sm">
                <span className="font-medium">Type:</span> {question.question_data.type}
              </div>
              {question.question_data.options && (
                <div className="text-sm">
                  <span className="font-medium">Options:</span>
                  <ul className="list-disc list-inside mt-1 ml-2">
                    {question.question_data.options.map((option: string, index: number) => (
                      <li key={index}>{option}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
