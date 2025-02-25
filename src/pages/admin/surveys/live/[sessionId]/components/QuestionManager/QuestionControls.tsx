
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SessionStatus } from "../../../types";

interface QuestionControlsProps {
  onFilterChange: (filter: "all" | "pending" | "active" | "completed") => void;
  currentFilter: "all" | "pending" | "active" | "completed";
  sessionStatus: SessionStatus;
}

export function QuestionControls({ 
  onFilterChange, 
  currentFilter,
  sessionStatus 
}: QuestionControlsProps) {
  const isSessionActive = sessionStatus === "active";

  return (
    <Card className="p-4 border-b rounded-t-lg rounded-b-none">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h3 className="font-medium">Filter Questions</h3>
          <RadioGroup
            defaultValue={currentFilter}
            onValueChange={(value) => 
              onFilterChange(value as "all" | "pending" | "active" | "completed")
            }
            className="flex items-center gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pending" id="pending" />
              <Label htmlFor="pending">Pending</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="active" id="active" />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="completed" id="completed" />
              <Label htmlFor="completed">Completed</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!isSessionActive}
          >
            Enable Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!isSessionActive}
          >
            Reset All
          </Button>
        </div>
      </div>
    </Card>
  );
}
