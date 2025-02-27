
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useTour } from "./TourContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TourButtonProps {
  tourId: string;
  title: string;
}

export function TourButton({ tourId, title }: TourButtonProps) {
  const { startTour, getTourCompletion } = useTour();
  const isCompleted = getTourCompletion(tourId);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => startTour(tourId)}
            className={isCompleted ? "text-muted-foreground" : "text-blue-500"}
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isCompleted ? "Review " : "Start "}{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
