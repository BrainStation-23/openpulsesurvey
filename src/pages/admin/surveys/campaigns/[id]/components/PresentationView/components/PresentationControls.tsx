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
    <>
      {/* Back button */}
      <div className={cn(
        "fixed top-4 left-4 z-30 transition-opacity duration-300",
        isFullscreen ? "opacity-0 hover:opacity-100" : "opacity-100"
      )}>
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="bg-white/80 hover:bg-white/90 backdrop-blur-sm border border-gray-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaign
        </Button>
      </div>

      {/* Navigation controls */}
      <div className={cn(
        "fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg transition-opacity duration-300",
        isFullscreen ? "opacity-0 hover:opacity-100" : "opacity-100"
      )}>
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevious}
          disabled={isFirstSlide}
          className="bg-white/80 hover:bg-white/90"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm font-medium">
          {currentSlide + 1} / {totalSlides}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={isLastSlide}
          className="bg-white/80 hover:bg-white/90"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Fullscreen toggle */}
      <div className={cn(
        "fixed top-4 right-4 z-30 transition-opacity duration-300",
        isFullscreen ? "opacity-0 hover:opacity-100" : "opacity-100"
      )}>
        <Button 
          variant="outline" 
          size="icon"
          onClick={onFullscreen}
          className="bg-white/80 hover:bg-white/90 backdrop-blur-sm border border-gray-200"
        >
          {isFullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </Button>
      </div>
    </>
  );
}