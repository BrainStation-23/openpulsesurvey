
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedRatingChart } from "./EnhancedRatingChart";
import { EnhancedBooleanChart } from "./EnhancedBooleanChart";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Minus, Sparkles } from "lucide-react";

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
    <Card className="w-full overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold">{questionTitle}</span>
            {isSignificantChange && <Sparkles size={16} className={scoreChange > 0 ? "text-amber-500" : "text-blue-500"} />}
          </div>
          <Badge className={`${questionType === 'rating' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                             questionType === 'boolean' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' : 
                             'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
            {questionType}
          </Badge>
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
            <div className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
              Period {basePeriod} → {comparisonPeriod}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        {questionType === "rating" && baseData.avg_numeric_value !== null && comparisonData.avg_numeric_value !== null && (
          <EnhancedRatingChart
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
          <EnhancedBooleanChart
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
          <div className="text-center text-muted-foreground py-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="mb-2 font-medium">Text Response Summary</p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-600">Period {basePeriod}</p>
                <p className="text-lg font-bold">{baseData.response_count || 0}</p>
                <p className="text-xs text-gray-500">responses</p>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-600">Period {comparisonPeriod}</p>
                <p className="text-lg font-bold">{comparisonData.response_count || 0}</p>
                <p className="text-xs text-gray-500">responses</p>
              </div>
            </div>
            <p className="mt-4 text-sm">
              <span className={responseChange > 0 ? "text-green-600" : responseChange < 0 ? "text-red-600" : "text-gray-600"}>
                {responseChange > 0 ? `+${responseChange}` : responseChange} response change
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
