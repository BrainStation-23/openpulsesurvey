
import { Card } from "@/components/ui/card";
import { ProcessedResponse } from "../../hooks/useResponseProcessing";
import { ComparisonDimension } from "../../types/comparison";
import { GroupedBarChart } from "../../charts/GroupedBarChart";

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
  layout = 'vertical'
}: BooleanComparisonProps) {
  const processData = () => {
    const groupedData: Record<string, { Yes: number; No: number }> = {};

    responses.forEach((response) => {
      const answer = response.answers[questionName]?.answer;
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
      }

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = { Yes: 0, No: 0 };
      }

      if (answer === true) {
        groupedData[groupKey].Yes++;
      } else if (answer === false) {
        groupedData[groupKey].No++;
      }
    });

    return Object.entries(groupedData).map(([name, data]) => ({
      name,
      ...data
    }));
  };

  const data = processData();
  const keys = ["Yes", "No"];
  const colors = ["#22c55e", "#ef4444"]; // Green for Yes, Red for No

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
          <h3 className="mb-4 text-lg font-semibold">{groupData.name}</h3>
          <div className="aspect-[2/1]">
            <GroupedBarChart 
              data={[groupData]} 
              keys={keys} 
              colors={colors}
              height={150}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
