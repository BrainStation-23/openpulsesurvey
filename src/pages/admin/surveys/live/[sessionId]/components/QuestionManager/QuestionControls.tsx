
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface QuestionControlsProps {
  onFilterChange: (filter: "all" | "pending" | "active" | "completed") => void;
  currentFilter: "all" | "pending" | "active" | "completed";
  onResetAll: () => void;
  hasActiveOrCompletedQuestions: boolean;
  questionCounts?: {
    all: number;
    pending: number;
    active: number;
    completed: number;
  };
}

export function QuestionControls({ 
  onFilterChange, 
  currentFilter,
  onResetAll,
  hasActiveOrCompletedQuestions,
  questionCounts = { all: 0, pending: 0, active: 0, completed: 0 },
}: QuestionControlsProps) {
  const filters = [
    { key: "all" as const, label: "All", count: questionCounts.all },
    { key: "pending" as const, label: "Pending", count: questionCounts.pending },
    { key: "active" as const, label: "Active", count: questionCounts.active },
    { key: "completed" as const, label: "Completed", count: questionCounts.completed },
  ];

  return (
    <Card className="border-b rounded-t-lg rounded-b-none">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm text-muted-foreground">Filter Questions</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetAll}
            disabled={!hasActiveOrCompletedQuestions}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset All
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Badge
              key={filter.key}
              variant={currentFilter === filter.key ? "default" : "outline"}
              className="cursor-pointer hover:bg-secondary/80 transition-colors"
              onClick={() => onFilterChange(filter.key)}
            >
              {filter.label} ({filter.count})
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
