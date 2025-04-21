
import React from "react";
import { PresentationLayout } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/components/PresentationLayout";
import { TitleSlide } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/slides/TitleSlide";
import { ResponseDistributionSlide } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/slides/ResponseDistributionSlide";
import { ResponseTrendsSlide } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/slides/ResponseTrendsSlide";
import { QuestionSlidesRenderer } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/components/QuestionSlidesRenderer";
import { COMPARISON_DIMENSIONS } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/constants";
import { CampaignData } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/types";
import { SharedPresentation } from "@/types/shared-presentations";

interface MainContentProps {
  campaign: CampaignData;
  presentation: SharedPresentation;
  currentSlide: number;
  totalSlides: number;
  isFullscreen: boolean;
  zoom: number;
}

export function MainContent({
  campaign,
  presentation,
  currentSlide,
  totalSlides,
  isFullscreen,
  zoom,
}: MainContentProps) {
  return (
    <div className="flex-1 relative overflow-hidden">
      <div
        className="absolute inset-0 flex items-center justify-center p-4"
        style={{ transform: `scale(${zoom})`, transition: "transform 200ms" }}
      >
        <div className="w-full h-full max-w-6xl mx-auto">
          <PresentationLayout 
            progress={((currentSlide + 1) / totalSlides) * 100}
            isFullscreen={isFullscreen}
          >
            <TitleSlide campaign={campaign} isActive={currentSlide === 0} />
            <ResponseDistributionSlide 
              campaignId={campaign.id} 
              instanceId={presentation.instance_id || undefined} 
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
        </div>
      </div>
    </div>
  );
}
