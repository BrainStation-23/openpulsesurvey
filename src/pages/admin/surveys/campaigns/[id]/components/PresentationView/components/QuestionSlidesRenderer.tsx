
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
    question => !["text", "comment"].includes(question.type)
  );

  let slideIndex = 3;  // Start after title, completion and trends slides

  // Flatten all slides to a flat array (for correct index math)
  const allSlides: React.ReactNode[] = [];
  for (const question of filteredQuestions) {
    const baseSlideIndex = slideIndex;
    allSlides.push(
      <QuestionSlide
        key={`${question.name}-main`}
        campaign={campaign}
        isActive={currentSlide === baseSlideIndex}
        questionName={question.name}
        questionTitle={question.title}
        questionType={question.type}
        slideType="main"
      />
    );
    slideIndex++;
    for (const dimension of COMPARISON_DIMENSIONS) {
      allSlides.push(
        <QuestionSlide
          key={`${question.name}-${dimension}`}
          campaign={campaign}
          isActive={currentSlide === slideIndex}
          questionName={question.name}
          questionTitle={question.title}
          questionType={question.type}
          slideType={dimension}
        />
      );
      slideIndex++;
    }
  }
  return <>{allSlides}</>;
}
