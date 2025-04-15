
import { memo } from "react";
import { SlideProps } from "../../types";
import { ComparisonDimension } from "../../types/comparison";
import { QuestionSlideLayout } from "./QuestionSlideLayout";
import { BooleanQuestionView } from "./BooleanQuestionView";
import { RatingQuestionView } from "./RatingQuestionView";
import { ComparisonView } from "./ComparisonView";
import { useQuestionData } from "./useQuestionData";
import { usePresentationResponses } from "../../hooks/usePresentationResponses";
import { ComparisonLayout } from "../../components/ComparisonLayout";
import { BooleanComparison } from "../../../ReportsTab/components/comparisons/BooleanComparison";
import { RatingComparison } from "../../../ReportsTab/components/comparisons/RatingComparison";
import { BooleanResponseData, RatingResponseData, SatisfactionData } from "../../types/responses";
import { isNpsQuestion } from "../../types/questionTypes";

interface QuestionSlideProps extends SlideProps {
  questionName: string;
  questionTitle: string;
  questionType: string;
  slideType: ComparisonDimension;
}

const QuestionSlideComponent = ({ 
  campaign, 
  isActive, 
  questionName, 
  questionTitle, 
  questionType,
  slideType = 'main'
}: QuestionSlideProps) => {
  // Always fetch data regardless of isActive to prevent hook count changes
  const { data } = usePresentationResponses(campaign.id, campaign.instance?.id);
  const processedData = useQuestionData(data, questionName, questionType, slideType);
  const question = data?.questions.find(q => q.name === questionName);
  const isNps = question ? isNpsQuestion(question) : false;

  // Don't render anything if the slide is not active
  if (!isActive) {
    return null;
  }

  // Skip rendering for text questions entirely
  if (questionType === "text" || questionType === "comment") {
    return null;
  }

  const getDimensionTitle = (dim: string) => {
    const titles: Record<string, string> = {
      sbu: "Response Distribution by Department",
      gender: "Response Distribution by Gender",
      location: "Response Distribution by Location",
      employment_type: "Response Distribution by Employment Type",
      level: "Response Distribution by Level",
      employee_type: "Response Distribution by Employee Type",
      employee_role: "Response Distribution by Employee Role",
      supervisor: "Response Distribution by Supervisor",
      none: "No Comparison"
    };
    return titles[dim] || "";
  };

  if (!processedData && !data?.responses) return null;

  return (
    <QuestionSlideLayout
      campaign={campaign}
      isActive={isActive}
      questionTitle={questionTitle}
    >
      {slideType === 'main' ? (
        <div className="w-full flex items-center justify-center">
          {questionType === "boolean" && (
            <BooleanQuestionView data={processedData as BooleanResponseData} />
          )}
          {questionType === "rating" && (
            <RatingQuestionView 
              data={processedData as (RatingResponseData | SatisfactionData)} 
              question={question}
            />
          )}
        </div>
      ) : (
        <ComparisonLayout title={getDimensionTitle(slideType)}>
          {questionType === "boolean" && (
            <BooleanComparison 
              responses={data.responses} 
              questionName={questionName}
              dimension={slideType}
              layout="grid"
            />
          )}
          {questionType === "rating" && (
            <RatingComparison
              responses={data.responses}
              questionName={questionName}
              question={question}
              dimension={slideType}
              layout="grid"
              campaignId={campaign.id}
              instanceId={campaign.instance?.id}
            />
          )}
        </ComparisonLayout>
      )}
    </QuestionSlideLayout>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const QuestionSlide = memo(QuestionSlideComponent);
