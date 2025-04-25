
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PresentationLayout } from "./components/PresentationLayout";
import { PresentationControls } from "./components/PresentationControls";
import { TitleSlide } from "./slides/TitleSlide";
import { ResponseDistributionSlide } from "./slides/ResponseDistributionSlide";
import { ResponseTrendsSlide } from "./slides/ResponseTrendsSlide";
import { usePresentationState } from "./hooks/usePresentationState";
import { usePresentationNavigation } from "./hooks/usePresentationNavigation";
import { COMPARISON_DIMENSIONS } from "./constants";
import { QuestionSlidesRenderer } from "./components/QuestionSlidesRenderer";
import { useCampaignData } from "./hooks/useCampaignData";
import { SharePresentationModal } from "./components/SharePresentationModal";
import { EnhancedExportButton } from "./components/EnhancedExportButton";

export default function PresentationView() {
  const navigate = useNavigate();
  const {
    currentSlide,
    setCurrentSlide,
    totalSlides,
    isFullscreen,
    setIsFullscreen,
  } = usePresentationState();
  
  const { handlePreviousSlide, handleNextSlide, handleFullscreen, handleBack } =
    usePresentationNavigation({
      currentSlide,
      setCurrentSlide,
      totalSlides,
      isFullscreen,
      setIsFullscreen,
      onBack: () => navigate("../"),
    });

  const { campaign, isLoading } = useCampaignData();
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNextSlide();
      } else if (e.key === "ArrowLeft") {
        handlePreviousSlide();
      } else if (e.key === "Escape" && isFullscreen) {
        handleFullscreen();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, handleNextSlide, handlePreviousSlide, isFullscreen, handleFullscreen]);

  if (isLoading || !campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-lg">Loading presentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <PresentationLayout
        progress={(currentSlide + 1) / totalSlides * 100}
        isFullscreen={isFullscreen}
      >
        <div className="flex justify-between items-center mb-4">
          <PresentationControls
            onPrevious={handlePreviousSlide}
            onNext={handleNextSlide}
            onFullscreen={handleFullscreen}
            onBack={handleBack}
            isFirstSlide={currentSlide === 0}
            isLastSlide={currentSlide === totalSlides - 1}
            isFullscreen={isFullscreen}
            currentSlide={currentSlide + 1}
            totalSlides={totalSlides}
          />
          
          <div className="flex gap-2">
            <button
              onClick={() => setShareModalOpen(true)}
              className="px-3 py-1.5 rounded bg-primary text-white hover:bg-primary/90 transition-colors text-sm"
            >
              Share
            </button>
            
            <EnhancedExportButton 
              campaign={campaign} 
              instanceId={campaign.instance?.id}
            />
          </div>
        </div>

        <TitleSlide campaign={campaign} isActive={currentSlide === 0} />
        <ResponseDistributionSlide
          campaignId={campaign.id}
          instanceId={campaign.instance?.id}
          isActive={currentSlide === 1}
          campaign={campaign}
        />
        <ResponseTrendsSlide campaign={campaign} isActive={currentSlide === 2} />
        <QuestionSlidesRenderer
          campaign={campaign}
          currentSlide={currentSlide}
          filterTypes={["text", "comment"]} // Only render non text/comment slides
        />
      </PresentationLayout>

      <SharePresentationModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        campaignId={campaign.id}
        instanceId={campaign.instance?.id}
      />
    </div>
  );
}
