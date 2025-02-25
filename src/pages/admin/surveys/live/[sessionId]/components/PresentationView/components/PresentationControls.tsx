
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize, Minimize, PlayCircle, RotateCcw } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface PresentationControlsProps {
  onBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onFullscreen: () => void;
  onEnableNext: () => void;
  onResetAll: () => void;
  isFirstSlide: boolean;
  isLastSlide: boolean;
  isFullscreen: boolean;
  currentSlide: number;
  totalSlides: number;
  isSessionActive: boolean;
  hasPendingQuestions: boolean;
  hasActiveOrCompletedQuestions: boolean;
}

export function PresentationControls({
  onBack,
  onPrevious,
  onNext,
  onFullscreen,
  onEnableNext,
  onResetAll,
  isFirstSlide,
  isLastSlide,
  isFullscreen,
  currentSlide,
  totalSlides,
  isSessionActive,
  hasPendingQuestions,
  hasActiveOrCompletedQuestions,
}: PresentationControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="text-black hover:bg-black/20 hover:text-black"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Session
      </Button>

      <div className="flex items-center gap-2 ml-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={!isSessionActive || !hasPendingQuestions}
                onClick={onEnableNext}
                className="flex items-center gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                Enable Next
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {!isSessionActive ? 
                "Session must be active to enable questions" : 
                !hasPendingQuestions ? 
                "No pending questions available" :
                "Enable next pending question"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={!isSessionActive || !hasActiveOrCompletedQuestions}
                onClick={onResetAll}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset All
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {!isSessionActive ? 
                "Session must be active to reset questions" : 
                !hasActiveOrCompletedQuestions ?
                "No questions to reset" :
                "Reset all questions to pending"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          disabled={isFirstSlide}
          className="text-black hover:bg-black/20 hover:text-black"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm font-medium text-black">
          {currentSlide} / {totalSlides}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          disabled={isLastSlide}
          className="text-black hover:bg-black/20 hover:text-black"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button 
          variant="ghost" 
          size="icon"
          onClick={onFullscreen}
          className="text-black hover:bg-black/20 hover:text-black"
        >
          {isFullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
