import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { TitleSlide } from "../admin/surveys/campaigns/[id]/components/PresentationView/slides/TitleSlide";
import { ResponseDistributionSlide } from "../admin/surveys/campaigns/[id]/components/PresentationView/slides/ResponseDistributionSlide";
import { ResponseTrendsSlide } from "../admin/surveys/campaigns/[id]/components/PresentationView/slides/ResponseTrendsSlide";
import { PresentationLayout } from "../admin/surveys/campaigns/[id]/components/PresentationView/components/PresentationLayout";
import { PresentationControls } from "../admin/surveys/campaigns/[id]/components/PresentationView/components/PresentationControls";
import { QuestionSlidesRenderer } from "../admin/surveys/campaigns/[id]/components/PresentationView/components/QuestionSlidesRenderer";
import { usePresentationNavigation } from "../admin/surveys/campaigns/[id]/components/PresentationView/hooks/usePresentationNavigation";
import { COMPARISON_DIMENSIONS } from "../admin/surveys/campaigns/[id]/components/PresentationView/constants";
import { CampaignData } from "../admin/surveys/campaigns/[id]/components/PresentationView/types";

export default function PublicPresentationView() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPresentationData = async () => {
      try {
        // First fetch the shared presentation info
        const { data: presentationData, error: presentationError } = await supabase
          .from("shared_presentations")
          .select("campaign_id, instance_id, expires_at, title, is_active")
          .eq("access_token", token)
          .single();

        if (presentationError) throw presentationError;

        // Check if presentation is still active and not expired
        if (!presentationData.is_active || (presentationData.expires_at && new Date(presentationData.expires_at) < new Date())) {
          throw new Error("This presentation link has expired or is no longer active");
        }

        // Fetch campaign data
        const { data: campaignData, error: campaignError } = await supabase
          .from("survey_campaigns")
          .select(`
            id,
            name,
            description,
            starts_at,
            ends_at,
            completion_rate,
            survey:surveys (
              id,
              name,
              description,
              json_data
            )
          `)
          .eq("id", presentationData.campaign_id)
          .single();

        if (campaignError) throw campaignError;

        // Fetch instance data if specified
        let instanceData = null;
        if (presentationData.instance_id) {
          const { data: instance, error: instanceError } = await supabase
            .from("campaign_instances")
            .select("*")
            .eq("id", presentationData.instance_id)
            .single();

          if (instanceError) throw instanceError;
          instanceData = instance;
        } else {
          // If no specific instance, get the latest one
          const { data: instance, error: instanceError } = await supabase
            .from("campaign_instances")
            .select("*")
            .eq("campaign_id", presentationData.campaign_id)
            .order("period_number", { ascending: false })
            .limit(1)
            .single();

          if (!instanceError) {
            instanceData = instance;
          }
        }

        // Prepare the campaign data in the format expected by the presentation components
        const parsedJsonData = typeof campaignData.survey.json_data === 'string' 
          ? JSON.parse(campaignData.survey.json_data) 
          : campaignData.survey.json_data;

        setCampaign({
          ...campaignData,
          instance: instanceData,
          survey: {
            ...campaignData.survey,
            json_data: parsedJsonData
          }
        });

      } catch (err) {
        console.error("Error fetching presentation data:", err);
        setError(err instanceof Error ? err.message : "Failed to load presentation");
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load presentation",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPresentationData();
  }, [token, toast]);

  const surveyQuestions = campaign?.survey.json_data.pages?.flatMap(
    (page) => page.elements || []
  ) || [];

  const totalSlides = 3 + (surveyQuestions.length * (1 + COMPARISON_DIMENSIONS.length));

  const {
    currentSlide,
    setCurrentSlide,
    isFullscreen,
    toggleFullscreen,
    handleBack: defaultHandleBack
  } = usePresentationNavigation({
    id: campaign?.id,
    instanceId: campaign?.instance?.id,
    totalSlides
  });

  // Override the back button to return to home page
  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-2">Loading presentation...</span>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Presentation Error</h1>
        <p className="text-gray-700 mb-6">{error || "Unable to load presentation"}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Return to Home
        </button>
      </div>
    );
  }

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
        currentSlide={currentSlide + 1}
        totalSlides={totalSlides}
        campaign={campaign}
      />
      
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
      />
    </PresentationLayout>
  );
}
