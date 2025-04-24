
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Maximize, Minimize, Loader } from "lucide-react";
import { CampaignData } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/types";
import { usePptxExport } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/hooks/usePptxExport";

interface PublicPresentationControlsProps {
  onBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onFullscreen: () => void;
  isFirstSlide: boolean;
  isLastSlide: boolean;
  isFullscreen: boolean;
  currentSlide: number;
  totalSlides: number;
  campaign: CampaignData;
}

export function PublicPresentationControls({
  onBack,
  onPrevious,
  onNext,
  onFullscreen,
  isFirstSlide,
  isLastSlide,
  isFullscreen,
  currentSlide,
  totalSlides,
  campaign,
}: PublicPresentationControlsProps) {
  // Use our optimized hook for PPTX export
  const { handleExport, exporting, progress } = usePptxExport(
    campaign.id, 
    campaign.instance?.id
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-black hover:bg-black/20 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Exit Presentation
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExport}
            disabled={exporting}
            className="text-black hover:bg-black/20 hover:text-black relative"
            title="Export to PPTX"
          >
            {exporting ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>

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

      {exporting && (
        <div className="w-full">
          <Progress value={progress} className="h-1" />
          <p className="text-xs text-center text-muted-foreground mt-1">
            Generating presentation... {progress}%
          </p>
        </div>
      )}
    </div>
  );
}
