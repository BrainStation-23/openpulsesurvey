
import { Card } from "@/components/ui/card";
import { ProcessedResponse } from "../../hooks/useResponseProcessing";
import { ComparisonDimension } from "../../types/comparison";

interface TextComparisonProps {
  responses: ProcessedResponse[];
  questionName: string;
  dimension: ComparisonDimension;
  layout?: 'grid' | 'vertical';
}

export function TextComparison({
  responses,
  questionName,
  dimension,
  layout = 'vertical'
}: TextComparisonProps) {
  const processData = () => {
    const groupedData: Record<string, string[]> = {};

    responses.forEach((response) => {
      const answer = response.answers[questionName]?.answer;
      if (typeof answer !== 'string' || answer.trim() === '') return;
      
      let groupKey = "Unknown";

      // Get the group key based on the dimension
      switch (dimension) {
        case "sbu":
          groupKey = response.respondent.sbu?.name || "No SBU";
          break;
        case "gender":
          groupKey = response.respondent.gender || "Not Specified";
          break;
        case "location":
          groupKey = response.respondent.location?.name || "No Location";
          break;
        case "employment_type":
          groupKey = response.respondent.employment_type?.name || "Not Specified";
          break;
        case "level":
          groupKey = response.respondent.level?.name || "Not Specified";
          break;
        case "employee_type":
          groupKey = response.respondent.employee_type?.name || "Not Specified";
          break;
        case "employee_role":
          groupKey = response.respondent.employee_role?.name || "Not Specified";
          break;
      }

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = [];
      }

      groupedData[groupKey].push(answer);
    });

    return Object.entries(groupedData).map(([name, answers]) => ({
      name,
      answers,
      count: answers.length
    }));
  };

  const data = processData();

  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No comparison data available
      </div>
    );
  }

  return (
    <div className={
      layout === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' 
        : 'space-y-4'
    }>
      {data.map((groupData) => (
        <Card key={groupData.name} className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">{groupData.name}</h3>
            <span className="text-sm text-muted-foreground">
              {groupData.count} responses
            </span>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {groupData.answers.slice(0, 5).map((answer, index) => (
              <div key={index} className="p-2 bg-muted rounded-md text-sm">
                {answer}
              </div>
            ))}
            {groupData.answers.length > 5 && (
              <div className="text-sm text-muted-foreground text-center">
                +{groupData.answers.length - 5} more responses
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
