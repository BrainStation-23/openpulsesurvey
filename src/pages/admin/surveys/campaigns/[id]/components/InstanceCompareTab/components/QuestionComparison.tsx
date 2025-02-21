
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GroupedBarChart } from "../../ReportsTab/charts/GroupedBarChart";
import type { QuestionComparison as QuestionComparisonType } from "../types/instance-comparison";

interface QuestionComparisonProps {
  baseInstance: QuestionComparisonType[];
  comparisonInstance: QuestionComparisonType[];
}

export function QuestionComparison({ baseInstance, comparisonInstance }: QuestionComparisonProps) {
  const numericQuestions = baseInstance.filter(q => q.avg_numeric_value !== null);
  const booleanQuestions = baseInstance.filter(q => q.yes_percentage !== null);

  const getComparisonData = (questions: QuestionComparisonType[], valueKey: keyof QuestionComparisonType) => {
    return questions.map(question => {
      const comparisonQuestion = comparisonInstance.find(q => q.question_key === question.question_key);
      return {
        name: question.question_key || 'Unknown',
        "Base Instance": question[valueKey] || 0,
        "Comparison Instance": comparisonQuestion?.[valueKey] || 0,
      };
    });
  };

  const numericData = getComparisonData(numericQuestions, 'avg_numeric_value');
  const booleanData = getComparisonData(booleanQuestions, 'yes_percentage');

  return (
    <div className="grid gap-6">
      {numericData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rating Questions Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <GroupedBarChart
              data={numericData}
              keys={["Base Instance", "Comparison Instance"]}
              height={300}
            />
          </CardContent>
        </Card>
      )}

      {booleanData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Yes/No Questions Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <GroupedBarChart
              data={booleanData}
              keys={["Base Instance", "Comparison Instance"]}
              height={300}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
