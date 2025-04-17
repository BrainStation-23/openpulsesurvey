
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingComparisonChart } from "./RatingComparisonChart";
import { BooleanComparisonChart } from "./BooleanComparisonChart";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

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
  basePeriod?: string;
  comparisonPeriod?: string;
}

export function QuestionCard({ 
  baseData, 
  comparisonData, 
  questionTitle,
  questionType,
  basePeriod = "",
  comparisonPeriod = ""
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

  // Calculate score changes for rating and boolean questions
  let scoreChange = 0;
  let scoreChangePercentage = 0;
  let hasScoreData = false;

  if (questionType === "rating" && 
      baseData.avg_numeric_value !== null && 
      comparisonData.avg_numeric_value !== null) {
    scoreChange = comparisonData.avg_numeric_value - baseData.avg_numeric_value;
    if (baseData.avg_numeric_value > 0) {
      scoreChangePercentage = (scoreChange / baseData.avg_numeric_value) * 100;
    }
    hasScoreData = true;
  } else if (questionType === "boolean" && 
      baseData.yes_percentage !== null && 
      comparisonData.yes_percentage !== null) {
    scoreChange = comparisonData.yes_percentage - baseData.yes_percentage;
    hasScoreData = true;
  }

  // Determine if change is significant (more than 5%)
  const isSignificantChange = Math.abs(scoreChangePercentage) > 5 || Math.abs(scoreChange) > 0.5;
  
  // Response count changes
  const baseResponses = baseData.response_count || 0;
  const comparisonResponses = comparisonData.response_count || 0;
  const responseChange = comparisonResponses - baseResponses;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="text-base">{questionTitle}</span>
          <Badge variant="outline">{questionType}</Badge>
        </CardTitle>
        {hasScoreData && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center">
              {scoreChange > 0 ? (
                <TrendingUp className={`h-4 w-4 ${isSignificantChange ? 'text-green-500' : 'text-muted-foreground'}`} />
              ) : scoreChange < 0 ? (
                <TrendingDown className={`h-4 w-4 ${isSignificantChange ? 'text-red-500' : 'text-muted-foreground'}`} />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={`ml-1 text-sm font-medium ${
                scoreChange > 0
                  ? isSignificantChange ? 'text-green-500' : 'text-muted-foreground'
                  : scoreChange < 0
                  ? isSignificantChange ? 'text-red-500' : 'text-muted-foreground'
                  : 'text-muted-foreground'
              }`}>
                {scoreChange > 0 ? '+' : ''}{questionType === 'rating' ? scoreChange.toFixed(2) : `${scoreChange.toFixed(1)}%`}
                {isSignificantChange && scoreChangePercentage !== 0 && questionType === 'rating' && (
                  <span className="ml-1">({scoreChangePercentage > 0 ? '+' : ''}{scoreChangePercentage.toFixed(1)}%)</span>
                )}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Period {basePeriod} → {comparisonPeriod}
            </div>
          </div>
        )}
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
          <div className="text-center text-muted-foreground py-4">
            <p className="mb-2 font-medium">Text Response Summary</p>
            <p>Base: {baseData.response_count || 0} responses</p>
            <p>Comparison: {comparisonData.response_count || 0} responses</p>
            <p className="mt-2">
              {responseChange > 0 ? `+${responseChange}` : responseChange} response change
            </p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Period {basePeriod}:</p>
            <div className="font-medium">
              {questionType === "rating" && baseData.avg_numeric_value !== null ? (
                <div className="flex items-center">
                  <span className="text-lg">{baseData.avg_numeric_value.toFixed(2)}</span>
                  <span className="ml-2 text-xs text-muted-foreground">({baseData.response_count || 0} responses)</span>
                </div>
              ) : questionType === "boolean" && baseData.yes_percentage !== null ? (
                <div className="flex items-center">
                  <span className="text-lg">{baseData.yes_percentage.toFixed(1)}%</span>
                  <span className="ml-2 text-xs text-muted-foreground">({baseData.response_count || 0} responses)</span>
                </div>
              ) : (
                <span>{baseData.response_count || 0} responses</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Period {comparisonPeriod}:</p>
            <div className="font-medium">
              {questionType === "rating" && comparisonData.avg_numeric_value !== null ? (
                <div className="flex items-center">
                  <span className="text-lg">{comparisonData.avg_numeric_value.toFixed(2)}</span>
                  <span className="ml-2 text-xs text-muted-foreground">({comparisonData.response_count || 0} responses)</span>
                </div>
              ) : questionType === "boolean" && comparisonData.yes_percentage !== null ? (
                <div className="flex items-center">
                  <span className="text-lg">{comparisonData.yes_percentage.toFixed(1)}%</span>
                  <span className="ml-2 text-xs text-muted-foreground">({comparisonData.response_count || 0} responses)</span>
                </div>
              ) : (
                <span>{comparisonData.response_count || 0} responses</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
