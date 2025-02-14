
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import DueDateInfo from "./components/DueDateInfo";
import { Assignment, ResponseStatus } from "@/pages/admin/surveys/types/assignments";

interface SurveyCardProps {
  assignment: Assignment;
  onSelect: (id: string) => void;
}

const getStatusColor = (status: ResponseStatus) => {
  switch (status) {
    case "submitted":
      return "success";
    case "expired":
      return "destructive";
    case "in_progress":
      return "secondary";
    default:
      return "default";
  }
};

const getDaysRemaining = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function SurveyCard({ assignment, onSelect }: SurveyCardProps) {
  const daysRemaining = getDaysRemaining(assignment.instance.ends_at);
  const isOverdue = daysRemaining < 0;
  const isDueSoon = daysRemaining <= 3 && daysRemaining > 0;
  const isNotSubmitted = assignment.status !== "submitted";

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:bg-accent/50 transition-colors",
        isNotSubmitted && isOverdue && "border-destructive",
        isNotSubmitted && isDueSoon && "border-yellow-500"
      )}
      onClick={() => onSelect(assignment.id)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {assignment.survey.name}
              {isNotSubmitted && (isOverdue || isDueSoon) && (
                <AlertCircle 
                  className={cn(
                    "h-5 w-5",
                    isOverdue ? "text-destructive" : "text-yellow-500"
                  )} 
                />
              )}
            </CardTitle>
            {assignment.survey.description && (
              <p className="text-sm text-muted-foreground">
                {assignment.survey.description}
              </p>
            )}
          </div>
          <Badge variant={getStatusColor(assignment.status)}>
            {assignment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <DueDateInfo
          dueDate={assignment.instance.ends_at}
          daysRemaining={daysRemaining}
          isOverdue={isOverdue}
          isDueSoon={isDueSoon}
          isPending={isNotSubmitted}
        />
      </CardContent>
    </Card>
  );
}
