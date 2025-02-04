import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ComparisonDimension } from "./types/comparison";
import { TitleSlide } from "./slides/TitleSlide";
import { CompletionRateSlide } from "./slides/CompletionRateSlide";
import { ResponseDistributionSlide } from "./slides/ResponseDistributionSlide";
import { ResponseTrendsSlide } from "./slides/ResponseTrendsSlide";
import { QuestionSlide } from "./slides/QuestionSlide";
import { PresentationLayout } from "./components/PresentationLayout";
import { PresentationControls } from "./components/PresentationControls";
import { CampaignData, SurveyJsonData } from "./types";

const COMPARISON_DIMENSIONS: ComparisonDimension[] = ['sbu', 'gender', 'location', 'employment_type'];

export default function PresentationView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const instanceId = searchParams.get('instance');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!instanceId) {
      toast({
        title: "No instance selected",
        description: "Please select an instance from the campaign page",
        variant: "destructive",
      });
      navigate(`/admin/surveys/campaigns/${id}`);
    }
  }, [instanceId, id, navigate, toast]);

  const { data: campaign } = useQuery({
    queryKey: ["campaign", id, instanceId],
    queryFn: async () => {
      const { data, error } = await supabase
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
        .eq("id", id)
        .single();

      if (error) throw error;

      const { data: instance, error: instanceError } = await supabase
        .from("campaign_instances")
        .select("*")
        .eq("id", instanceId)
        .single();

      if (instanceError) throw instanceError;
      
      // Parse json_data to ensure it matches SurveyJsonData type
      const parsedJsonData = typeof data.survey.json_data === 'string' 
        ? JSON.parse(data.survey.json_data) 
        : data.survey.json_data;

      return {
        ...data,
        instance,
        survey: {
          ...data.survey,
          json_data: parsedJsonData as SurveyJsonData
        }
      } as CampaignData;
    },
    enabled: !!id && !!instanceId,
  });

  const surveyQuestions = (campaign?.survey.json_data.pages || []).flatMap(
    (page) => page.elements || []
  );

  const totalSlides = 4 + (surveyQuestions.length * (1 + COMPARISON_DIMENSIONS.length));

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
  }, [totalSlides]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleBack = () => {
    navigate(`/admin/surveys/campaigns/${id}`);
  };

  const renderQuestionSlides = () => {
    return surveyQuestions.map((question, index) => {
      const baseSlideIndex = 4 + (index * (1 + COMPARISON_DIMENSIONS.length));
      
      const slides = [(
        <QuestionSlide
          key={`${question.name}-main`}
          campaign={campaign}
          isActive={currentSlide === baseSlideIndex}
          questionName={question.name}
          questionTitle={question.title}
          questionType={question.type}
          slideType="main"
        />
      )];

      COMPARISON_DIMENSIONS.forEach((dimension, dimIndex) => {
        slides.push(
          <QuestionSlide
            key={`${question.name}-${dimension}`}
            campaign={campaign}
            isActive={currentSlide === baseSlideIndex + dimIndex + 1}
            questionName={question.name}
            questionTitle={question.title}
            questionType={question.type}
            slideType={dimension}
          />
        );
      });

      return slides;
    });
  };

  if (!campaign) return null;

  return (
    <PresentationLayout progress={((currentSlide + 1) / totalSlides) * 100}>
      <PresentationControls
        onBack={handleBack}
        onPrevious={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
        onNext={() => setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1))}
        onFullscreen={toggleFullscreen}
        isFirstSlide={currentSlide === 0}
        isLastSlide={currentSlide === totalSlides - 1}
      />
      
      <TitleSlide campaign={campaign} isActive={currentSlide === 0} />
      <CompletionRateSlide campaign={campaign} isActive={currentSlide === 1} />
      <ResponseDistributionSlide campaign={campaign} isActive={currentSlide === 2} />
      <ResponseTrendsSlide campaign={campaign} isActive={currentSlide === 3} />
      {renderQuestionSlides()}
    </PresentationLayout>
  );
}