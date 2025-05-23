
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
  className?: string; // Add optional className prop
}

export function TourButton({ tourId, title, className }: TourButtonProps) {
  const { startTour, getTourCompletion } = useTour();
  const isCompleted = getTourCompletion(tourId);

  const handleStartTour = () => {
    console.log("Starting tour:", tourId);
    startTour(tourId);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStartTour}
            className={className || (isCompleted ? "text-muted-foreground" : "text-blue-500")}
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
