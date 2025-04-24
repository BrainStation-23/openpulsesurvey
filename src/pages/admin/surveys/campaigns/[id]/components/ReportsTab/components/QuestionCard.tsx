
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BooleanCharts } from "../charts/BooleanCharts";
import { NpsChart } from "../charts/NpsChart";
import { WordCloud } from "../charts/WordCloud";
import { SatisfactionChart } from "../charts/SatisfactionChart";
import { ComparisonSelector } from "./ComparisonSelector";
import { BooleanComparison } from "./comparisons/BooleanComparison";
import { NpsComparison } from "./comparisons/NpsComparison";
import { TextComparison } from "./comparisons/TextComparison";
import { ComparisonDimension } from "../types/comparison";
import { processAnswersForQuestion } from "../utils/answerProcessing";
import { ProcessedResponse } from "../hooks/useResponseProcessing";
import { NpsData } from "../types/nps";

interface QuestionCardProps {
  question: any;
  responses: ProcessedResponse[];
  comparisonDimension: ComparisonDimension;
  onComparisonChange: (dimension: ComparisonDimension) => void;
  campaignId: string;
  instanceId?: string;
}

export function QuestionCard({
  question,
  responses,
  comparisonDimension,
  onComparisonChange,
  campaignId,
  instanceId
}: QuestionCardProps) {
  const processedData = processAnswersForQuestion(
    question.name,
    question.type,
    question,
    responses
  );
  
  const isNpsQuestion = question.type === "rating" && question.rateCount === 10;

  return (
    <Card key={question.name} className="w-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{question.title}</CardTitle>
        <ComparisonSelector
          value={comparisonDimension}
          onChange={onComparisonChange}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {comparisonDimension === "none" && (
          <>
            {question.type === "boolean" && (
              <BooleanCharts
                data={processedData as { yes: number; no: number }}
                title={question.title}
              />
            )}
            {(question.type === "nps" || question.type === "rating") && (
              <>
                {isNpsQuestion ? (
                  <NpsChart
                    data={processedData as NpsData}
                    title={question.title}
                  />
                ) : (
                  <SatisfactionChart
                    data={processedData as { 
                      unsatisfied: number;
                      neutral: number;
                      satisfied: number;
                      total: number;
                      median: number;
                    }}
                    title={question.title}
                  />
                )}
              </>
            )}
            {(question.type === "text" || question.type === "comment") && (
              <WordCloud
                words={processedData as { text: string; value: number }[]}
                title={question.title}
              />
            )}
          </>
        )}

        {comparisonDimension !== "none" && (
          <>
            {question.type === "boolean" && (
              <BooleanComparison
                responses={responses}
                questionName={question.name}
                dimension={comparisonDimension}
                campaignId={campaignId}
                instanceId={instanceId || ""}
              />
            )}
            {(question.type === "nps" || question.type === "rating") && (
              <NpsComparison
                responses={responses}
                questionName={question.name}
                dimension={comparisonDimension}
                isNps={isNpsQuestion}
                campaignId={campaignId}
                instanceId={instanceId}
              />
            )}
            {(question.type === "text" || question.type === "comment") && (
              <TextComparison
                responses={responses}
                questionName={question.name}
                dimension={comparisonDimension}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
