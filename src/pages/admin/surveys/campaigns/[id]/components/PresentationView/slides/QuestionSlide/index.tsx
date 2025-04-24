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
import { GroupedBarChart } from "../../../ReportsTab/charts/GroupedBarChart";
import { BooleanComparison as BooleanGroupedComparison } from "../../../ReportsTab/components/comparisons/BooleanComparison";
import { NpsComparisonTable } from "../../../ReportsTab/components/comparisons/NpsComparisonTable";

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

  // --- NEW: NPS TABLE for grouped eNPS slides (all rating dimension slides except 'main') ---
  if (
    questionType === "rating" &&
    isNps &&
    slideType !== "main" &&
    Array.isArray(processedData) &&
    processedData.length > 0 &&
    processedData[0].dimension !== undefined
  ) {
    // Adapt processedData (array of { dimension, detractors, passives, promoters, total })
    // into NpsComparisonTable expected format: [{ dimension, ratings: [{ rating, count }, ...] }]
    const npsTableData = processedData.map((group: any) => {
      // Build ratings from detractors/passives/promoters; need rating index 0-10 with count, since NpsComparisonTable expects per-rating counts
      // We'll estimate the breakdown by assigning the group totals to their segment's respective rating range, with the rating itself as a proxy.
      // However, our data only provides segment totals, not detailed per-rating info. For real data, adapt accordingly!
      // We can spread each segment total equally across their respective rating bands.
      const ratings = Array.from({ length: 11 }, (_, i) => {
        if (i <= 6) {
          const c = group.detractors || 0;
          // Detractors: 0-6 (7 values)
          return { rating: i, count: c ? Math.round(c / 7) : 0 };
        } else if (i <= 8) {
          const c = group.passives || 0;
          // Passives: 7-8 (2 values)
          return { rating: i, count: c ? Math.round(c / 2) : 0 };
        } else {
          const c = group.promoters || 0;
          // Promoters: 9-10 (2 values)
          return { rating: i, count: c ? Math.round(c / 2) : 0 };
        }
      });
      // Adjust for rounding error so total adds up to group.total
      let sum = ratings.reduce((a, b) => a + b.count, 0);
      if (sum !== group.total) {
        // Adjust last promoter bucket to make total correct
        ratings[10].count += (group.total - sum);
      }
      return {
        dimension: group.dimension,
        ratings
      };
    });

    return (
      <QuestionSlideLayout
        campaign={campaign}
        isActive={isActive}
        questionTitle={questionTitle}
      >
        <ComparisonLayout title={getDimensionTitle(slideType)}>
          <div className="w-full">
            <NpsComparisonTable data={npsTableData} />
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
          {questionType === "boolean" && (
            <BooleanQuestionView data={processedData as BooleanResponseData} />
          )}
          {questionType === "rating" && (
            <RatingQuestionView 
              data={processedData as (RatingResponseData | SatisfactionData)} 
              isNps={isNps} 
            />
          )}
        </div>
      ) : (
        <ComparisonLayout title={getDimensionTitle(slideType)}>
          {questionType === "boolean" && (
            <BooleanGroupedComparison 
              responses={data.responses} 
              questionName={questionName}
              dimension={slideType}
              campaignId={campaign.id}
              instanceId={campaign.instance?.id || ""}
            />
          )}
          {questionType === "rating" && (
            slideType === "supervisor" ? (
              <NpsComparison
                responses={data.responses}
                questionName={questionName}
                dimension={slideType}
                isNps={isNps}
                campaignId={campaign.id}
                instanceId={campaign.instance?.id}
              />
            ) : !isNps ? (
              <ComparisonView 
                data={processedData}
                isNps={isNps}
              />
            ) : null
          )}
        </ComparisonLayout>
      )}
    </QuestionSlideLayout>
  );
};

export const QuestionSlide = memo(QuestionSlideComponent);
