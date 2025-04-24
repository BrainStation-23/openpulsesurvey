
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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {chartType === "pie" && (
            <div className="flex flex-wrap gap-2 text-xs max-w-[120px]">
              {formattedData.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-sm flex-shrink-0"
                    style={{ 
                      backgroundColor: [
                        '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
                        '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'
                      ][index % 8] 
                    }}
                  />
                  <span className="truncate" title={item.name}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-3 min-h-0">
        {chartType === "pie" ? (
          <div className="h-full w-full">
            <DemographicPieChart 
              data={formattedData} 
              title={`Response Distribution by ${title}`}
              showLegend={false}
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
