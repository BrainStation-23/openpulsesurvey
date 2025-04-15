
import { CampaignData } from "../types";
import { QuestionSlide } from "../slides/QuestionSlide";
import { COMPARISON_DIMENSIONS } from "../constants";

interface QuestionSlidesRendererProps {
  campaign: CampaignData;
  currentSlide: number;
}

export function QuestionSlidesRenderer({ campaign, currentSlide }: QuestionSlidesRendererProps) {
  const surveyQuestions = (campaign?.survey.json_data.pages || []).flatMap(
    (page) => page.elements || []
  );

  // Filter out text and comment questions
  const filteredQuestions = surveyQuestions.filter(
    question => question.type !== "text" && question.type !== "comment"
  );

  let slideIndex = 3; // Start after the first 3 slides (title, distribution, trends)

  return filteredQuestions.map((question, index) => {
    const baseSlideIndex = slideIndex;
    
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

    // Increment slide index for the main slide
    slideIndex++;

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
      
      // Increment slide index for each comparison dimension
      slideIndex++;
    });

    return slides;
  });
}
