
import { useParams, useSearchParams } from "react-router-dom";
import { TitleSlide } from "./slides/TitleSlide";
import { ResponseDistributionSlide } from "./slides/ResponseDistributionSlide";
import { ResponseTrendsSlide } from "./slides/ResponseTrendsSlide";
import { PresentationLayout } from "./components/PresentationLayout";
import { PresentationControls } from "./components/PresentationControls";
import { QuestionSlidesRenderer } from "./components/QuestionSlidesRenderer";
import { useCampaignData } from "./hooks/useCampaignData";
import { usePresentationNavigation } from "./hooks/usePresentationNavigation";
import { COMPARISON_DIMENSIONS } from "./constants";

export default function PresentationView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const instanceId = searchParams.get('instance');

  const { data: campaign } = useCampaignData(id, instanceId);

  // Filter out text and comment type questions
  const filteredQuestions = (campaign?.survey.json_data.pages || [])
    .flatMap(page => page.elements || [])
    .filter(question => question.type !== "text" && question.type !== "comment");

  const totalSlides = 3 + (filteredQuestions.length * (1 + COMPARISON_DIMENSIONS.length));

  const {
    currentSlide,
    setCurrentSlide,
    isFullscreen,
    toggleFullscreen,
    handleBack
  } = usePresentationNavigation({
    id,
    instanceId,
    totalSlides
  });

  if (!campaign) return null;

  return (
    <PresentationLayout 
      progress={((currentSlide + 1) / totalSlides) * 100}
      isFullscreen={isFullscreen}
    >
      <PresentationControls
        onBack={handleBack}
        onPrevious={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
        onNext={() => setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1))}
        onFullscreen={toggleFullscreen}
        isFirstSlide={currentSlide === 0}
        isLastSlide={currentSlide === totalSlides - 1}
        isFullscreen={isFullscreen}
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        campaign={campaign}
      />
      
      <TitleSlide campaign={campaign} isActive={currentSlide === 0} />
      <ResponseDistributionSlide 
        campaignId={campaign.id} 
        instanceId={instanceId || undefined} 
        isActive={currentSlide === 1}
        campaign={campaign}
      />
      <ResponseTrendsSlide campaign={campaign} isActive={currentSlide === 2} />
      <QuestionSlidesRenderer 
        campaign={campaign}
        currentSlide={currentSlide}
      />
    </PresentationLayout>
  );
}
