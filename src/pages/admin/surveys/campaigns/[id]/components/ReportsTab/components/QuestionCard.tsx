import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useDimensionComparison } from "../hooks/useDimensionComparison";
import { ComparisonSelector } from "./ComparisonSelector";
import { ComparisonDimension } from "../types/comparison";
import { HeatMapChart } from "../charts/HeatMapChart";
import { NpsChart } from "../charts/NpsChart";
import { GroupedBarChart } from "../charts/GroupedBarChart";
import { processAnswersForQuestion } from "../utils/answerProcessing";
import { RadioGroupChart } from "../charts/RadioGroupChart";

interface QuestionCardProps {
  question: any;
  responses: any[];
  campaignId: string;
  instanceId: string;
  onExportToPowerPoint?: (questionName: string, chartData: any) => void;
}

export function QuestionCard({ question, responses, campaignId, instanceId, onExportToPowerPoint }: QuestionCardProps) {
  const [comparisonDimension, setComparisonDimension] = useState<ComparisonDimension>("none");
  
  const questionName = question.name;
  const questionType = question.type;
  const isNps = questionType === "rating" && question.rateCount === 10;
  const isBoolean = questionType === "boolean";
  const isRadioGroup = questionType === "radiogroup" || questionType === "multiple_choice";
  
  // Get dimension comparison data
  const { data: comparisonData, isLoading: isComparisonLoading } = useDimensionComparison(
    campaignId,
    instanceId,
    questionName,
    comparisonDimension,
    isNps,
    isBoolean,
    isRadioGroup
  );

  // Process answers based on question type
  const processedData = processAnswersForQuestion(
    questionName,
    questionType,
    question,
    responses
  );

  const renderComparisonChart = () => {
    if (!comparisonData || comparisonData.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No comparison data available for this dimension
        </div>
      );
    }

    if (isBoolean) {
      const chartData = comparisonData.map((item: any) => ({
        name: item.dimension,
        Yes: item.yes_count,
        No: item.no_count
      }));

      return (
        <GroupedBarChart 
          data={chartData}
          keys={["Yes", "No"]}
          colors={["#22c55e", "#ef4444"]}
          height={300}
        />
      );
    }

    if (isRadioGroup) {
      // For radiogroup data, create a grouped bar chart with all choices
      const allChoices = new Set<string>();
      comparisonData.forEach((item: any) => {
        item.choice_data.forEach((choice: any) => {
          allChoices.add(choice.choice_text);
        });
      });

      const chartData = comparisonData.map((item: any) => {
        const dimensionData: any = { name: item.dimension };
        item.choice_data.forEach((choice: any) => {
          dimensionData[choice.choice_text] = choice.count;
        });
        return dimensionData;
      });

      const colors = ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#8b5cf6", "#f97316"];

      return (
        <GroupedBarChart 
          data={chartData}
          keys={Array.from(allChoices)}
          colors={colors}
          height={300}
        />
      );
    }

    if (isNps) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {comparisonData.map((groupData: any) => (
            <div key={groupData.dimension} className="bg-card rounded-lg border p-4">
              <h4 className="font-medium mb-3">{groupData.dimension}</h4>
              <NpsChart data={groupData} />
            </div>
          ))}
        </div>
      );
    }

    return <HeatMapChart data={comparisonData} />;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{question.title || questionName}</CardTitle>
          {onExportToPowerPoint && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExportToPowerPoint(questionName, processedData)}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Overall Results</h3>
          <div className="h-[300px]">
            {questionType === "boolean" && (
              <GroupedBarChart 
                data={[{
                  name: "Responses",
                  Yes: processedData.yes,
                  No: processedData.no
                }]}
                keys={["Yes", "No"]}
                colors={["#22c55e", "#ef4444"]}
                height={300}
              />
            )}
            
            {(questionType === "radiogroup" || questionType === "multiple_choice") && (
              <RadioGroupChart 
                data={processedData}
                chartType="bar"
              />
            )}
            
            {questionType === "rating" && !isNps && (
              <GroupedBarChart 
                data={[{
                  name: "Satisfaction",
                  Unsatisfied: processedData.unsatisfied,
                  Neutral: processedData.neutral,
                  Satisfied: processedData.satisfied
                }]}
                keys={["Unsatisfied", "Neutral", "Satisfied"]}
                colors={["#ef4444", "#eab308", "#22c55e"]}
                height={300}
              />
            )}
            
            {isNps && (
              <div className="flex justify-center">
                <NpsChart data={processedData} />
              </div>
            )}
            
            {(questionType === "text" || questionType === "comment") && (
              <div className="text-center text-muted-foreground">
                Text responses: {processedData.length} entries
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Demographic Comparison</h3>
            <ComparisonSelector 
              value={comparisonDimension}
              onChange={setComparisonDimension}
            />
          </div>
          
          {comparisonDimension !== "none" && (
            <div className="min-h-[300px]">
              {isComparisonLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <LoadingSpinner />
                </div>
              ) : (
                renderComparisonChart()
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
