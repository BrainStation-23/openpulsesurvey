
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import { PlayCircle, RotateCcw } from "lucide-react";
import { SessionStatus } from "../../../types";

interface QuestionControlsProps {
  onFilterChange: (filter: "all" | "pending" | "active" | "completed") => void;
  currentFilter: "all" | "pending" | "active" | "completed";
  sessionStatus: SessionStatus;
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
  sessionStatus,
  questionCounts = { all: 0, pending: 0, active: 0, completed: 0 }
}: QuestionControlsProps) {
  const isSessionActive = sessionStatus === "active";

  const filters = [
    { key: "all" as const, label: "All", count: questionCounts.all },
    { key: "pending" as const, label: "Pending", count: questionCounts.pending },
    { key: "active" as const, label: "Active", count: questionCounts.active },
    { key: "completed" as const, label: "Completed", count: questionCounts.completed },
  ];

  return (
    <Card className="border-b rounded-t-lg rounded-b-none">
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-muted-foreground mb-2">Filter Questions</h3>
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

        <div className="flex items-center gap-2 flex-shrink-0">
          <Tooltip content={!isSessionActive ? "Session must be active to enable questions" : "Enable next pending question"}>
            <Button
              variant="outline"
              size="sm"
              disabled={!isSessionActive}
              className="flex items-center gap-2"
            >
              <PlayCircle className="h-4 w-4" />
              Enable Next
            </Button>
          </Tooltip>
          
          <Tooltip content={!isSessionActive ? "Session must be active to reset questions" : "Reset all questions to pending"}>
            <Button
              variant="outline"
              size="sm"
              disabled={!isSessionActive}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All
            </Button>
          </Tooltip>
        </div>
      </div>
    </Card>
  );
}
