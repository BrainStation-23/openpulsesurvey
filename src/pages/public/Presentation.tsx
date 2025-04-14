import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";
import { TitleSlide } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/slides/TitleSlide";
import { ResponseDistributionSlide } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/slides/ResponseDistributionSlide";
import { ResponseTrendsSlide } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/slides/ResponseTrendsSlide";
import { PresentationLayout } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/components/PresentationLayout";
import { QuestionSlidesRenderer } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/components/QuestionSlidesRenderer";
import { COMPARISON_DIMENSIONS } from "@/pages/admin/surveys/campaigns/[id]/components/PresentationView/constants";
import { useSharedPresentation } from "./hooks/useSharedPresentation";
import { PublicPresentationControls } from "./components/PublicPresentationControls";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Presentation() {
  const { token } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { 
    data: presentation, 
    isLoading, 
    error 
  } = useSharedPresentation(token as string);

  const campaign = presentation?.campaign;
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "This presentation link is invalid or has expired.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1));
      } else if (e.key === "f") {
        toggleFullscreen();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [campaign]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="container max-w-md mx-auto mt-20 p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Link</AlertTitle>
          <AlertDescription>
            This presentation link is invalid or has expired.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const surveyQuestions = (campaign?.survey.json_data.pages || []).flatMap(
    (page) => page.elements || []
  );

  const totalSlides = 3 + (surveyQuestions.length * (1 + COMPARISON_DIMENSIONS.length));

  return (
    <>
      <Helmet>
        <title>{campaign.name} - Presentation</title>
      </Helmet>
      
      <PresentationLayout 
        progress={((currentSlide + 1) / totalSlides) * 100}
        isFullscreen={isFullscreen}
      >
        <PublicPresentationControls
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
          instanceId={presentation.instance_id || undefined} 
          isActive={currentSlide === 1}
          campaign={campaign}
        />
        <ResponseTrendsSlide campaign={campaign} isActive={currentSlide === 2} />
        <QuestionSlidesRenderer 
          campaign={campaign}
          currentSlide={currentSlide}
        />
      </PresentationLayout>
    </>
  );
}
