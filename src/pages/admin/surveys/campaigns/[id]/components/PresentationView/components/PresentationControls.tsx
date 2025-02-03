import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, Fullscreen } from "lucide-react";
import { cn } from "@/lib/utils";

interface PresentationControlsProps {
  onBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onFullscreen: () => void;
  isFirstSlide: boolean;
  isLastSlide: boolean;
}

export function PresentationControls({
  onBack,
  onPrevious,
  onNext,
  onFullscreen,
  isFirstSlide,
  isLastSlide,
}: PresentationControlsProps) {
  return (
    <>
      <div className="absolute top-4 left-4 z-10">
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

      <div className="absolute top-4 right-4 z-10 space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onFullscreen}
          className="bg-white/80 hover:bg-white/90 backdrop-blur-sm border border-gray-200"
        >
          <Fullscreen className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-4 right-4 z-10 space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevious}
          disabled={isFirstSlide}
          className={cn(
            "bg-white/80 hover:bg-white/90 backdrop-blur-sm border border-gray-200",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={isLastSlide}
          className={cn(
            "bg-white/80 hover:bg-white/90 backdrop-blur-sm border border-gray-200",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}