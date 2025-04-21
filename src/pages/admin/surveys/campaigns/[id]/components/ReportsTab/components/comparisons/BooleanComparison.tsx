
import { GroupedBarChart } from "../../charts/GroupedBarChart";
import { ProcessedResponse } from "../../hooks/useResponseProcessing";
import { ComparisonDimension } from "../../types/comparison";

interface BooleanComparisonProps {
  responses: ProcessedResponse[];
  questionName: string;
  dimension: ComparisonDimension;
  layout?: 'grid' | 'vertical';
}

export function BooleanComparison({
  responses,
  questionName,
  dimension,
}: BooleanComparisonProps) {
  // Aggregate yes/no counts for each group (SBU, gender, etc)
  const groupedMap = new Map<string, { Yes: number; No: number }>();

  responses.forEach((response) => {
    const answer = response.answers[questionName]?.answer;
    let groupKey = "Unknown";
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

    if (!groupedMap.has(groupKey)) {
      groupedMap.set(groupKey, { Yes: 0, No: 0 });
    }
    const groupData = groupedMap.get(groupKey)!;
    if (answer === true) {
      groupData.Yes++;
    } else if (answer === false) {
      groupData.No++;
    }
  });

  // Prepare chart data format
  const chartData = Array.from(groupedMap.entries()).map(([name, data]) => ({
    name,
    Yes: data.Yes,
    No: data.No,
  }));

  if (!chartData.length) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No comparison data available
      </div>
    );
  }

  // Use Yes (green) / No (red) coloring
  const keys = ["Yes", "No"];
  const colors = ["#22c55e", "#ef4444"]; 

  return (
    <div className="w-full overflow-x-auto max-w-full">
      <GroupedBarChart 
        data={chartData} 
        keys={keys}
        colors={colors}
        height={320}
      />
    </div>
  );
}
