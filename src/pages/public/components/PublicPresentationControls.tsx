import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Maximize, Minimize, ArrowLeft } from "lucide-react";
import { CampaignData } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/types";
interface PublicPresentationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onFullscreen: () => void;
  onBack: () => void;
  isFirstSlide: boolean;
  isLastSlide: boolean;
  isFullscreen: boolean;
  currentSlide: number;
  totalSlides: number;
  campaign: CampaignData;
}
export function PublicPresentationControls({
  onPrevious,
  onNext,
  onFullscreen,
  onBack,
  isFirstSlide,
  isLastSlide,
  isFullscreen,
  currentSlide,
  totalSlides,
  campaign
}: PublicPresentationControlsProps) {
  return <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        

        <div className="text-lg font-semibold text-black truncate">
          {campaign.name}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" onClick={onPrevious} disabled={isFirstSlide} className="text-black hover:bg-black/20 hover:text-black">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm font-medium text-black">
            {currentSlide} / {totalSlides}
          </span>

          <Button variant="ghost" size="icon" onClick={onNext} disabled={isLastSlide} className="text-black hover:bg-black/20 hover:text-black">
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={onFullscreen} className="text-black hover:bg-black/20 hover:text-black">
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>;
}