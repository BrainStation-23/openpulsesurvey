
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResponseProcessing } from "./hooks/useResponseProcessing";
import { BooleanCharts } from "./charts/BooleanCharts";
import { NpsScaleChart, RatingScaleChart, SatisfactionScaleChart } from "./charts/RatingScaleChart";
import { WordCloud } from "./charts/WordCloud";
import { ComparisonSelector } from "./components/ComparisonSelector";
import { BooleanComparison } from "./components/comparisons/BooleanComparison";
import { RatingComparison } from "./components/comparisons/RatingComparison";
import { TextComparison } from "./components/comparisons/TextComparison";
import { useState } from "react";
import { ComparisonDimension } from "./types/comparison";
import { isNpsQuestion } from "../PresentationView/types/questionTypes";
import { processRatingQuestion } from "./hooks/useRatingProcessing";

interface ReportsTabProps {
  campaignId: string;
  instanceId?: string;
}

export function ReportsTab({ campaignId, instanceId }: ReportsTabProps) {
  const { data, isLoading } = useResponseProcessing(campaignId, instanceId);
  const [comparisonDimensions, setComparisonDimensions] = useState<
    Record<string, ComparisonDimension>
  >({});

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || !data.questions || !data.responses) {
    return <div>No data available</div>;
  }

  const handleComparisonChange = (questionName: string, dimension: ComparisonDimension) => {
    setComparisonDimensions((prev) => ({
      ...prev,
      [questionName]: dimension,
    }));
  };

  return (
    <div className="grid gap-6">
      {data.questions.map((question) => {
        const currentDimension = comparisonDimensions[question.name] || "none";
        
        // Extract answers for this question
        const answers = data.responses
          .map(response => response.answers[question.name]?.answer)
          .filter(answer => answer !== undefined);
        
        return (
          <Card key={question.name} className="w-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>{question.title}</CardTitle>
              <ComparisonSelector
                value={currentDimension}
                onChange={(dimension) =>
                  handleComparisonChange(question.name, dimension)
                }
              />
            </CardHeader>
            <CardContent className="space-y-4">
              {currentDimension === "none" && (
                <>
                  {question.type === "boolean" && (
                    <BooleanCharts
                      data={{
                        yes: answers.filter(a => a === true).length,
                        no: answers.filter(a => a === false).length
                      }}
                    />
                  )}
                  {question.type === "rating" && (
                    <>
                      {isNpsQuestion(question) ? (
                        <NpsScaleChart
                          data={answers.filter(a => typeof a === 'number').map(a => ({
                            rating: a as number,
                            count: answers.filter(val => val === a).length
                          }))}
                        />
                      ) : (
                        <SatisfactionScaleChart
                          data={processRatingQuestion(
                            answers.filter(a => typeof a === 'number') as number[],
                            question
                          ).data}
                        />
                      )}
                    </>
                  )}
                  {(question.type === "text" || question.type === "comment") && (
                    <WordCloud
                      words={processTextAnswers(answers)}
                    />
                  )}
                </>
              )}

              {currentDimension !== "none" && (
                <>
                  {question.type === "boolean" && (
                    <BooleanComparison
                      responses={data.responses}
                      questionName={question.name}
                      dimension={currentDimension}
                    />
                  )}
                  {question.type === "rating" && (
                    <RatingComparison
                      responses={data.responses}
                      questionName={question.name}
                      question={question}
                      dimension={currentDimension}
                      campaignId={campaignId}
                      instanceId={instanceId}
                    />
                  )}
                  {(question.type === "text" || question.type === "comment") && (
                    <TextComparison
                      responses={data.responses}
                      questionName={question.name}
                      dimension={currentDimension}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Helper function for text processing
function processTextAnswers(answers: any[]) {
  const wordFrequency: Record<string, number> = {};
  
  answers.forEach((answer) => {
    if (typeof answer === "string") {
      const words = answer
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 2);

      words.forEach((word) => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
    }
  });

  return Object.entries(wordFrequency)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50);
}
