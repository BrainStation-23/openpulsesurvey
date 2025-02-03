import { SlideProps } from "../../types";
import { ComparisonDimension } from "../../types/comparison";
import { QuestionSlideLayout } from "./QuestionSlideLayout";
import { BooleanQuestionView } from "./BooleanQuestionView";
import { RatingQuestionView } from "./RatingQuestionView";
import { TextQuestionView } from "./TextQuestionView";
import { ComparisonView } from "./ComparisonView";
import { useQuestionData } from "./useQuestionData";
import { usePresentationResponses } from "../../hooks/usePresentationResponses";
import { BooleanResponseData, RatingResponseData, SatisfactionData, TextResponseData } from "../../types/responses";

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
  const processedData = useQuestionData(data, questionName, questionType, slideType);
  const question = data?.questions.find(q => q.name === questionName);
  const isNps = question?.type === 'rating' && question?.rateCount === 10;

  const getDimensionTitle = (dim: string) => {
    const titles: Record<string, string> = {
      sbu: "Response Distribution by Department",
      gender: "Response Distribution by Gender",
      location: "Response Distribution by Location",
      employment_type: "Response Distribution by Employment Type"
    };
    return titles[dim] || "";
  };

  if (!processedData) return null;

  return (
    <QuestionSlideLayout
      campaign={campaign}
      isActive={isActive}
      questionTitle={questionTitle}
      comparisonTitle={slideType !== 'main' ? getDimensionTitle(slideType) : undefined}
    >
      {slideType === 'main' ? (
        <>
          {questionType === "boolean" && (
            <BooleanQuestionView data={processedData as BooleanResponseData} />
          )}
          {questionType === "rating" && (
            <RatingQuestionView 
              data={processedData as (RatingResponseData | SatisfactionData)} 
              isNps={isNps} 
            />
          )}
          {(questionType === "text" || questionType === "comment") && (
            <TextQuestionView data={processedData as TextResponseData} />
          )}
        </>
      ) : (
        <ComparisonView 
          data={processedData}
          isNps={isNps}
          dimensionTitle={getDimensionTitle(slideType)}
        />
      )}
    </QuestionSlideLayout>
  );
}