
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCampaignData } from "@/hooks/useCampaignData";

// Import your existing components
import { PresentationLayout } from "./components/PresentationLayout";
import { PresentationControls } from "./components/PresentationControls";
import { ComparisonLayout } from "./components/ComparisonLayout";
import { SharePresentationModal } from "./components/SharePresentationModal";
import { usePresentationResponses } from "./hooks/usePresentationResponses";
import { usePresentationState } from "./hooks/usePresentationState";
import { usePresentationNavigation } from "./hooks/usePresentationNavigation";
import { usePptxExport } from "./hooks/usePptxExport";

// Import the slides
import { TitleSlide } from "./slides/TitleSlide";
import { CompletionRateSlide } from "./slides/CompletionRateSlide";
import { StatusDistributionSlide } from "./slides/StatusDistributionSlide";
import { ResponseDistributionSlide } from "./slides/ResponseDistributionSlide";
import { ResponseTrendsSlide } from "./slides/ResponseTrendsSlide";
import { QuestionSlidesRenderer } from "./components/QuestionSlidesRenderer";

// Import styles
import "./styles.css";

export default function PresentationView() {
  const navigate = useNavigate();
  const { data: campaign, isLoading, isError } = useCampaignData();
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Wait for campaign data before initializing other hooks
  const { 
    data, 
    comparisonData, 
    isLoading: isLoadingResponses
  } = usePresentationResponses(campaign?.id, instanceId);

  // Initialize presentation state
  const { 
    state, 
    updateState,
    isComparison, 
    setIsComparison
  } = usePresentationState();

  // Initialize navigation
  const {
    currentSlideIndex,
    totalSlides,
    goToNextSlide,
    goToPrevSlide,
    goToSlide,
    slideRefs
  } = usePresentationNavigation(data, state.showComments);

  // Initialize PPTX export
  const { exportToPptx } = usePptxExport(
    campaign, 
    data, 
    comparisonData, 
    state, 
    isComparison
  );

  // Handle instance selection when campaign loads
  useEffect(() => {
    if (campaign?.instances && campaign.instances.length > 0) {
      // Find the most recent completed instance
      const completedInstances = campaign.instances
        .filter(instance => instance.status === 'completed')
        .sort((a, b) => new Date(b.ends_at).getTime() - new Date(a.ends_at).getTime());
      
      if (completedInstances.length > 0) {
        setInstanceId(completedInstances[0].id);
      } else {
        // If no completed instance, use the most recent one
        const sortedInstances = [...campaign.instances]
          .sort((a, b) => new Date(b.ends_at).getTime() - new Date(a.ends_at).getTime());
        
        setInstanceId(sortedInstances[0].id);
      }
    }
  }, [campaign]);

  // Handle PPTX export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToPptx();
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading || isLoadingResponses) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/surveys/campaigns")}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Campaigns
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
          <h2 className="text-xl font-semibold text-destructive mb-2">Campaign not found</h2>
          <p className="text-muted-foreground">The campaign you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate("/admin/surveys/campaigns")}
          >
            Return to Campaigns
          </Button>
        </div>
      </div>
    );
  }

  // Determine which layout to use based on comparison mode
  const Layout = isComparison ? ComparisonLayout : PresentationLayout;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate(`/admin/surveys/campaigns/${campaign.id}`)}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Campaign
        </Button>
        <h1 className="text-xl font-bold">{campaign.name} - Presentation</h1>
      </div>

      <PresentationControls
        campaign={campaign}
        currentSlideIndex={currentSlideIndex}
        totalSlides={totalSlides}
        goToNextSlide={goToNextSlide}
        goToPrevSlide={goToPrevSlide}
        goToSlide={goToSlide}
        onExport={handleExport}
        isExporting={isExporting}
        onShare={() => setShowShareModal(true)}
        presentationState={state}
        updatePresentationState={updateState}
        instanceId={instanceId}
        setInstanceId={setInstanceId}
        isComparison={isComparison}
        setIsComparison={setIsComparison}
      />

      <Layout>
        {/* Title slide */}
        <TitleSlide
          ref={el => slideRefs.current[0] = el}
          campaign={campaign}
          instanceId={instanceId}
        />

        {/* Overview slides */}
        <CompletionRateSlide
          ref={el => slideRefs.current[1] = el}
          data={data}
          comparisonData={comparisonData}
          isComparison={isComparison}
        />

        <StatusDistributionSlide
          ref={el => slideRefs.current[2] = el}
          data={data}
          comparisonData={comparisonData}
          isComparison={isComparison}
        />

        <ResponseDistributionSlide
          ref={el => slideRefs.current[3] = el}
          data={data}
          comparisonData={comparisonData}
          isComparison={isComparison}
        />

        <ResponseTrendsSlide
          ref={el => slideRefs.current[4] = el}
          data={data}
          campaign={campaign}
          comparisonData={comparisonData}
          isComparison={isComparison}
        />

        {/* Question slides */}
        <QuestionSlidesRenderer 
          data={data}
          comparisonData={comparisonData}
          isComparison={isComparison}
          showComments={state.showComments}
          slideRefs={slideRefs}
          startIndex={5}
        />
      </Layout>

      {showShareModal && (
        <SharePresentationModal
          campaignId={campaign.id}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
