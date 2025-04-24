
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemographicBarChart } from "../DemographicBarChart";
import { DemographicPieChart } from "../DemographicPieChart";
import { DemographicBreakdownItem } from "../../types";

interface DemographicCardProps {
  title: string;
  data: DemographicBreakdownItem[] | any[];
  chartType: "pie" | "bar";
  nameKey?: string;
}

export function DemographicCard({ title, data, chartType, nameKey = "name" }: DemographicCardProps) {
  const formattedData = nameKey !== "name" ? data.map(item => ({
    name: item[nameKey],
    count: item.count,
    percentage: item.percentage
  })) : data;

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-1">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-3 pt-0 overflow-hidden">
        {chartType === "pie" ? (
          <div className="h-full w-full">
            <DemographicPieChart 
              data={formattedData} 
              title={`Response Distribution by ${title}`}
            />
          </div>
        ) : (
          <div className="h-full w-full">
            <DemographicBarChart 
              data={data} 
              title={`Response Distribution by ${title}`}
              nameKey={nameKey}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
