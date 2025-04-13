
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ComparisonDimension } from "../../types/comparison";

interface BooleanComparisonProps {
  data: any[];
  dimension: ComparisonDimension;
  layout?: "vertical" | "grid";
}

export function BooleanComparison({ 
  data, 
  dimension,
  layout = "vertical" 
}: BooleanComparisonProps) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No comparison data available</div>;
  }

  // Format the data for the chart
  const chartData = data.map((group) => ({
    name: group.dimension,
    Yes: group.yes_count,
    No: group.no_count,
    yesPercentage: group.total > 0 ? (group.yes_count / group.total) * 100 : 0,
  })).sort((a, b) => b.yesPercentage - a.yesPercentage);

  if (layout === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                width={60}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="Yes" stackId="a" fill="#4CAF50" />
              <Bar dataKey="No" stackId="a" fill="#F44336" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" unit="%" domain={[0, 100]} />
              <YAxis
                dataKey="name"
                type="category"
                width={60}
                tick={{ fontSize: 12 }}
              />
              <Tooltip formatter={(value: any) => {
                // Handle both number and string values
                return typeof value === 'number' 
                  ? [`${value.toFixed(1)}%`, "Yes"] 
                  : [value, "Yes"];
              }} />
              <Bar
                dataKey="yesPercentage"
                fill="#4CAF50"
                name="Yes %"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            dataKey="name"
            type="category"
            width={60}
            tick={{ fontSize: 12 }}
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="Yes" stackId="a" fill="#4CAF50" />
          <Bar dataKey="No" stackId="a" fill="#F44336" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
