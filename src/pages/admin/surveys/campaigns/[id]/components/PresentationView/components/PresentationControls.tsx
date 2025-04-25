
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-react";
import { CampaignData } from "../types";
import { SharePresentationModal } from "./SharePresentationModal";
import { ExportButton } from "./ExportButton";

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
  campaign: CampaignData;
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
  campaign,
}: PresentationControlsProps) {
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
          Back to Campaign
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          <SharePresentationModal 
            campaignId={campaign.id} 
            instanceId={campaign.instance?.id} 
          />
          
          {/* Replace old export button with new decoupled component */}
          <ExportButton 
            campaignId={campaign.id}
            instanceId={campaign.instance?.id} 
          />

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
            {currentSlide + 1} / {totalSlides}
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
    </div>
  );
}
