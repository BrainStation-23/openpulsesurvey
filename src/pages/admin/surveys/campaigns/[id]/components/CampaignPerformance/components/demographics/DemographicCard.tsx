import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
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

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

  // Limit to top categories and group others for cleaner visualization
  const MAX_SLICES = 5;
  let chartData = [...formattedData];
  
  if (chartType === "pie" && chartData.length > MAX_SLICES) {
    const topItems = chartData.slice(0, MAX_SLICES - 1);
    const otherItems = chartData.slice(MAX_SLICES - 1);
    
    const othersCount = otherItems.reduce((sum, item) => sum + item.count, 0);
    const othersPercentage = otherItems.reduce((sum, item) => sum + item.percentage, 0);
    
    topItems.push({
      name: 'Others',
      count: othersCount,
      percentage: othersPercentage
    });
    
    chartData = topItems;
  }

  return (
    <Card className="h-[525px] flex flex-col overflow-hidden">
      <CardHeader className="p-4 pb-2 border-b flex-shrink-0">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {chartType === "pie" && (
            <div className="flex flex-wrap gap-2 text-xs max-w-[120px]">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
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
      <CardContent className="p-0 flex-1 overflow-hidden">
        {chartType === "pie" ? (
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius="80%"
                  innerRadius="0%"
                  fill="#8884d8"
                  dataKey="count"
                  label={({ percent }) => 
                    percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
                  }
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => {
                    const item = props.payload;
                    return [`Count: ${value}`, `${item.percentage.toFixed(1)}%`];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 60, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={60}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                />
                <Tooltip
                  formatter={(value, name, props) => {
                    const item = props.payload;
                    return [`Count: ${value}`, `${item.percentage.toFixed(1)}%`];
                  }}
                />
                <Bar dataKey="count" name="Count">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
