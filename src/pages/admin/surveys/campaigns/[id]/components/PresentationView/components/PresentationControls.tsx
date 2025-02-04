import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-react";
import { cn } from "@/lib/utils";

interface PresentationControlsProps {
  onBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onFullscreen: () => void;
  isFirstSlide: boolean;
  isLastSlide: boolean;
  isFullscreen: boolean;
  currentSlide: number;
  totalSlides: number;
}

export function PresentationControls({
  onBack,
  onPrevious,
  onNext,
  onFullscreen,
  isFirstSlide,
  isLastSlide,
  isFullscreen,
  currentSlide,
  totalSlides,
}: PresentationControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="text-white hover:bg-white/20 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Campaign
      </Button>

      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          disabled={isFirstSlide}
          className="text-white hover:bg-white/20 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm font-medium text-white">
          {currentSlide + 1} / {totalSlides}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          disabled={isLastSlide}
          className="text-white hover:bg-white/20 hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button 
          variant="ghost" 
          size="icon"
          onClick={onFullscreen}
          className="text-white hover:bg-white/20 hover:text-white"
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