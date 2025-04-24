
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartType === "pie" ? (
          <DemographicPieChart 
            data={formattedData} 
            title={`Response Distribution by ${title}`}
          />
        ) : (
          <DemographicBarChart 
            data={data} 
            title={`Response Distribution by ${title}`}
            nameKey={nameKey}
          />
        )}
      </CardContent>
    </Card>
  );
}
