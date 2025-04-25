
import { memo } from "react";
import { CampaignData } from "../types";
import { QuestionSlide } from "../slides/QuestionSlide";
import { COMPARISON_DIMENSIONS } from "../constants";
import { ComparisonDimension } from "../types/comparison";

interface QuestionSlidesRendererProps {
  campaign: CampaignData;
  currentSlide: number;
  filterTypes?: string[];
}

export const QuestionSlidesRenderer = memo(function QuestionSlidesRenderer({ 
  campaign, 
  currentSlide,
  filterTypes = []
}: QuestionSlidesRendererProps) {
  // Get survey questions from campaign data, excluding specified types
  const questions = (campaign.survey.json_data.pages || [])
    .flatMap(page => page.elements || [])
    .filter(q => !filterTypes.includes(q.type));
  
  // Calculate the base slide index (after title, distribution and trends slides)
  const baseIndex = 3;
  
  // For each question, we have 1 + COMPARISON_DIMENSIONS.length slides
  const slidesPerQuestion = 1 + COMPARISON_DIMENSIONS.length;
  
  // Render all question slides
  return (
    <>
      {questions.map((question, questionIndex) => {
        // Calculate the offset for this question's slides
        const questionOffset = questionIndex * slidesPerQuestion;
        
        // Create main question slide
        const mainSlideIndex = baseIndex + questionOffset;
        
        // Create comparison slides for each dimension
        return (
          <React.Fragment key={question.name}>
            {/* Main question slide */}
            <QuestionSlide
              campaign={campaign}
              isActive={currentSlide === mainSlideIndex}
              questionName={question.name}
              questionTitle={question.title || question.name}
              questionType={question.type}
              slideType="main"
            />
            
            {/* Comparison dimension slides */}
            {COMPARISON_DIMENSIONS.map((dimension, dimensionIndex) => {
              const dimensionSlideIndex = mainSlideIndex + dimensionIndex + 1;
              
              return (
                <QuestionSlide
                  key={`${question.name}-${dimension}`}
                  campaign={campaign}
                  isActive={currentSlide === dimensionSlideIndex}
                  questionName={question.name}
                  questionTitle={question.title || question.name}
                  questionType={question.type}
                  slideType={dimension as ComparisonDimension}
                />
              );
            })}
          </React.Fragment>
        );
      })}
    </>
  );
});
