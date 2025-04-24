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
import { NpsComparison } from "../../../ReportsTab/components/comparisons/NpsComparison";
import { BooleanResponseData, RatingResponseData, SatisfactionData } from "../../types/responses";
import { NpsData, NpsComparisonData } from "../../../ReportsTab/types/nps";
import { NpsComparisonTable } from "../../../ReportsTab/components/comparisons/NpsComparisonTable";

interface QuestionSlideProps extends SlideProps {
  questionName: string;
  questionTitle: string;
  questionType: string;
  slideType: ComparisonDimension;
}

export function QuestionSlide({ 
  campaign, 
  isActive, 
  questionName, 
  questionTitle, 
  questionType,
  slideType = 'main'
}: QuestionSlideProps) {
  const { data } = usePresentationResponses(campaign.id, campaign.instance?.id);
  const processedData = useQuestionData(
    data, 
    questionName, 
    questionType, 
    slideType,
    campaign.id,
    campaign.instance?.id
  );
  
  const question = data?.questions.find(q => q.name === questionName);
  const isNps = question?.type === 'rating' && question?.rateCount === 10;

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

  // --- For NPS dimensional slides (all rating dimension slides except 'main') ---
  if (
    questionType === "rating" &&
    isNps &&
    slideType !== "main" &&
    Array.isArray(processedData) &&
    processedData.length > 0 &&
    'dimension' in processedData[0] &&
    'detractors' in processedData[0]
  ) {
    return (
      <QuestionSlideLayout
        campaign={campaign}
        isActive={isActive}
        questionTitle={questionTitle}
      >
        <ComparisonLayout title={getDimensionTitle(slideType)}>
          <div className="w-full">
            <NpsComparisonTable data={processedData as NpsComparisonData[]} />
          </div>
        </ComparisonLayout>
      </QuestionSlideLayout>
    );
  }

  return (
    <QuestionSlideLayout
      campaign={campaign}
      isActive={isActive}
      questionTitle={questionTitle}
    >
      {slideType === 'main' ? (
        <div className="w-full flex items-center justify-center">
          {questionType === "boolean" && processedData && 'yes' in processedData && 'no' in processedData && (
            <BooleanQuestionView data={processedData as BooleanResponseData} />
          )}
          {questionType === "rating" && (
            <RatingQuestionView 
              data={isNps 
                ? (processedData as NpsData) 
                : (processedData as (RatingResponseData | SatisfactionData))} 
              isNps={isNps} 
            />
          )}
        </div>
      ) : (
        <ComparisonLayout title={getDimensionTitle(slideType)}>
          {questionType === "boolean" && processedData && 'yes' in processedData && 'no' in processedData && (
            <BooleanQuestionView data={processedData as BooleanResponseData} />
          )}
          {questionType === "rating" && (
            <NpsComparison
              responses={data.responses}
              questionName={questionName}
              dimension={slideType}
              isNps={isNps}
              campaignId={campaign.id}
              instanceId={campaign.instance?.id}
            />
          )}
        </ComparisonLayout>
      )}
    </QuestionSlideLayout>
  );
}
