
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
import { ExportMenu } from "./ExportMenu";
import { useDimensionComparison } from "../hooks/useDimensionComparison";

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
  const chartId = `chart-${question.name}`;
  const fileName = `${question.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_data`;

  // Get comparison data when a dimension is selected
  const { data: comparisonData, isLoading } = useDimensionComparison(
    campaignId,
    instanceId,
    question.name,
    comparisonDimension,
    isNpsQuestion,
    question.type === "boolean"
  );

  // Determine which data to use for export based on comparison state
  const exportData = comparisonDimension !== "none" && comparisonData ? comparisonData : 
    Array.isArray(processedData) ? processedData : [processedData];

  return (
    <Card key={question.name} className="w-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{question.title}</CardTitle>
        <div className="flex items-center gap-2">
          <ExportMenu
            chartId={chartId}
            fileName={fileName}
            data={exportData}
            isComparison={comparisonDimension !== "none"}
            isNps={isNpsQuestion}
            isBoolean={question.type === "boolean"}
          />
          <ComparisonSelector
            value={comparisonDimension}
            onChange={onComparisonChange}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div id={chartId}>
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
                      data={processedData as NpsData}
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
        </div>
      </CardContent>
    </Card>
  );
}
