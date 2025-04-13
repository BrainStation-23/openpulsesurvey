
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BooleanCharts } from "../charts/BooleanCharts";
import { NpsChart } from "../charts/NpsChart";
import { WordCloud } from "../charts/WordCloud";
import { SatisfactionDonutChart } from "../charts/SatisfactionDonutChart";
import { ComparisonSelector } from "./ComparisonSelector";
import { BooleanComparison } from "./comparisons/BooleanComparison";
import { NpsComparison } from "./comparisons/NpsComparison";
import { TextComparison } from "./comparisons/TextComparison";
import { useState } from "react";
import { ComparisonDimension } from "../types/comparison";
import { useResponseProcessing } from "../hooks/useResponseProcessing";
import { useComparisonData } from "../hooks/useComparisonData";
import { useTextAnalysis } from "../hooks/useTextAnalysis";

interface QuestionReportCardProps {
  campaignId: string;
  instanceId?: string;
  question: {
    name: string;
    title: string;
    type: string;
    rateCount?: number;
  };
}

export function QuestionReportCard({ 
  campaignId, 
  instanceId, 
  question 
}: QuestionReportCardProps) {
  const [comparisonDimension, setComparisonDimension] = useState<ComparisonDimension>("none");
  const { data: responseData } = useResponseProcessing(campaignId, instanceId);
  const { data: comparisonData } = useComparisonData({
    campaignId,
    instanceId,
    questionName: question.name,
    dimension: comparisonDimension
  });
  const { data: textAnalysisData } = useTextAnalysis({
    campaignId,
    instanceId,
    questionName: question.name
  });

  const isNpsQuestion = question.type === "rating" && question.rateCount === 10;

  // Process the answers for this question
  const processAnswersForQuestion = () => {
    if (!responseData?.responses) return null;
    
    const answers = responseData.responses.map(
      (response) => response.answers[question.name]?.answer
    );

    switch (question.type) {
      case "boolean":
        return {
          yes: answers.filter((a) => a === true).length,
          no: answers.filter((a) => a === false).length,
        };

      case "rating":
      case "nps": {
        if (isNpsQuestion) {
          const ratingCounts = new Array(11).fill(0);
          answers.forEach((rating) => {
            if (typeof rating === "number" && rating >= 0 && rating <= 10) {
              ratingCounts[rating]++;
            }
          });
          return ratingCounts.map((count, rating) => ({ rating, count }));
        } else {
          const validAnswers = answers.filter(
            (rating) => typeof rating === "number" && rating >= 1 && rating <= 5
          );
          
          const calculateMedian = (ratings: number[]) => {
            const sorted = [...ratings].sort((a, b) => a - b);
            const middle = Math.floor(sorted.length / 2);
            
            if (sorted.length % 2 === 0) {
              return (sorted[middle - 1] + sorted[middle]) / 2;
            }
            return sorted[middle];
          };
          
          return {
            unsatisfied: validAnswers.filter((r) => r <= 2).length,
            neutral: validAnswers.filter((r) => r === 3).length,
            satisfied: validAnswers.filter((r) => r >= 4).length,
            total: validAnswers.length,
            median: calculateMedian(validAnswers)
          };
        }
      }

      case "text":
      case "comment": {
        // Use the processed word cloud data from the hook
        return Array.isArray(textAnalysisData) ? textAnalysisData : [];
      }

      default:
        return null;
    }
  };

  const processedData = processAnswersForQuestion();

  if (!processedData) return null;

  return (
    <Card key={question.name} className="w-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{question.title}</CardTitle>
        <ComparisonSelector
          value={comparisonDimension}
          onChange={(dimension) => setComparisonDimension(dimension)}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {comparisonDimension === "none" && (
          <>
            {question.type === "boolean" && (
              <BooleanCharts
                data={processedData as { yes: number; no: number }}
              />
            )}
            {(question.type === "nps" || question.type === "rating") && (
              <>
                {isNpsQuestion ? (
                  <NpsChart
                    data={processedData as { rating: number; count: number }[]}
                  />
                ) : (
                  <SatisfactionDonutChart
                    data={processedData as { 
                      unsatisfied: number;
                      neutral: number;
                      satisfied: number;
                      total: number;
                      median: number;
                    }}
                  />
                )}
              </>
            )}
            {(question.type === "text" || question.type === "comment") && (
              <WordCloud
                words={processedData as { text: string; value: number }[]}
              />
            )}
          </>
        )}

        {comparisonDimension !== "none" && Array.isArray(comparisonData) && (
          <>
            {question.type === "boolean" && (
              <BooleanComparison
                data={comparisonData}
                dimension={comparisonDimension}
              />
            )}
            {(question.type === "nps" || question.type === "rating") && (
              <NpsComparison
                data={comparisonData}
                dimension={comparisonDimension}
                isNps={isNpsQuestion}
              />
            )}
            {(question.type === "text" || question.type === "comment") && (
              <TextComparison
                data={comparisonData}
                dimension={comparisonDimension}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
