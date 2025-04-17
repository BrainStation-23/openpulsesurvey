
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingComparisonChart } from "./RatingComparisonChart";
import { BooleanComparisonChart } from "./BooleanComparisonChart";
import { Badge } from "@/components/ui/badge";

interface QuestionData {
  period_number: number | null;
  campaign_instance_id: string | null;
  response_count: number | null;
  avg_numeric_value: number | null;
  yes_percentage: number | null;
  question_key: string | null;
  text_responses: string[] | null;
}

interface QuestionCardProps {
  baseData: QuestionData;
  comparisonData: QuestionData;
  questionTitle: string;
  questionType: "rating" | "boolean" | "text";
}

export function QuestionCard({ 
  baseData, 
  comparisonData, 
  questionTitle,
  questionType
}: QuestionCardProps) {
  // Handle cases where we have missing data
  if (!baseData || !comparisonData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-base">{questionTitle}</span>
            <Badge variant="outline">{questionType}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            No comparison data available for this question
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-base">{questionTitle}</span>
          <Badge variant="outline">{questionType}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {questionType === "rating" && baseData.avg_numeric_value !== null && comparisonData.avg_numeric_value !== null && (
          <RatingComparisonChart
            baseInstanceData={{
              avg_numeric_value: baseData.avg_numeric_value,
              response_count: baseData.response_count || 0,
            }}
            comparisonInstanceData={{
              avg_numeric_value: comparisonData.avg_numeric_value,
              response_count: comparisonData.response_count || 0,
            }}
            questionKey={questionTitle}
            basePeriodNumber={baseData.period_number || undefined}
            comparisonPeriodNumber={comparisonData.period_number || undefined}
          />
        )}

        {questionType === "boolean" && baseData.yes_percentage !== null && comparisonData.yes_percentage !== null && (
          <BooleanComparisonChart
            baseInstanceData={{
              yes_percentage: baseData.yes_percentage,
              response_count: baseData.response_count || 0,
            }}
            comparisonInstanceData={{
              yes_percentage: comparisonData.yes_percentage,
              response_count: comparisonData.response_count || 0,
            }}
            questionKey={questionTitle}
            basePeriodNumber={baseData.period_number || undefined}
            comparisonPeriodNumber={comparisonData.period_number || undefined}
          />
        )}

        {questionType === "text" && (
          <p className="text-center text-muted-foreground py-4">
            Text response comparison not supported
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Base responses:</p>
            <p className="font-medium">{baseData.response_count || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Comparison responses:</p>
            <p className="font-medium">{comparisonData.response_count || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
