
import { CampaignData } from "../types";
import { QuestionSlide } from "../slides/QuestionSlide";
import { COMPARISON_DIMENSIONS } from "../constants";
import { ComparisonDimension } from "../types/comparison";

interface QuestionSlidesRendererProps {
  campaign: CampaignData;
  currentSlide: number;
}

export function QuestionSlidesRenderer({ campaign, currentSlide }: QuestionSlidesRendererProps) {
  const surveyQuestions = (campaign?.survey.json_data.pages || []).flatMap(
    (page) => page.elements || []
  );

  return surveyQuestions.map((question, index) => {
    const baseSlideIndex = 3 + (index * (1 + COMPARISON_DIMENSIONS.length));
    const isSatisfactionQuestion = question.type === 'rating' && question.rateCount === 5;
    
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
      // Skip supervisor dimension for non-satisfaction questions
      if (dimension === 'supervisor' && !isSatisfactionQuestion) {
        return;
      }
      
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
}
