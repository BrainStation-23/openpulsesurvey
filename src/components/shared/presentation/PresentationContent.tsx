
import { SlideProps } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/types";
import { CampaignData, ProcessedData } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/types";
import { PresentationLayout } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/components/PresentationLayout";
import { PresentationControls } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/components/PresentationControls";
import { TitleSlide } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/slides/TitleSlide";
import { StatusDistributionSlide } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/slides/StatusDistributionSlide";
import { ResponseTrendsSlide } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/slides/ResponseTrendsSlide";
import { QuestionSlidesRenderer } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/components/QuestionSlidesRenderer";
import { useState } from "react";

interface PresentationContentProps {
  campaign: CampaignData;
  processedData?: ProcessedData;
  controls?: boolean;
  onBack?: () => void;
}

export function PresentationContent({ 
  campaign, 
  processedData,
  controls = true,
  onBack 
}: PresentationContentProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const surveyQuestions = (campaign?.survey.json_data.pages || []).flatMap(
    (page) => page.elements || []
  );

  const totalSlides = 3 + (surveyQuestions.length * 2);
  const progress = ((currentSlide + 1) / totalSlides) * 100;

  return (
    <PresentationLayout 
      progress={progress}
      isFullscreen={isFullscreen}
    >
      {controls && (
        <PresentationControls
          onBack={onBack}
          onPrevious={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
          onNext={() => setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1))}
          onFullscreen={() => setIsFullscreen(!isFullscreen)}
          isFirstSlide={currentSlide === 0}
          isLastSlide={currentSlide === totalSlides - 1}
          isFullscreen={isFullscreen}
          currentSlide={currentSlide + 1}
          totalSlides={totalSlides}
          campaign={campaign}
        />
      )}
      
      <TitleSlide campaign={campaign} isActive={currentSlide === 0} />
      <StatusDistributionSlide campaign={campaign} isActive={currentSlide === 1} />
      <ResponseTrendsSlide campaign={campaign} isActive={currentSlide === 2} />
      <QuestionSlidesRenderer 
        campaign={campaign}
        currentSlide={currentSlide}
      />
    </PresentationLayout>
  );
}
