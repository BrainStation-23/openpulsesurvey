
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface QuestionControlsProps {
  onFilterChange: (filter: "all" | "pending" | "active" | "completed") => void;
  currentFilter: "all" | "pending" | "active" | "completed";
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
    </Card>
  );
}
