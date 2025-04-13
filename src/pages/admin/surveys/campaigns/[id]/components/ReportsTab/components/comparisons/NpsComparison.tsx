
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

interface NpsComparisonProps {
  data: any[];
  dimension: ComparisonDimension;
  isNps: boolean;
}

export function NpsComparison({ data, dimension, isNps }: NpsComparisonProps) {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No comparison data available</div>;
  }

  // Format the data for the chart
  let chartData;
  
  if (isNps) {
    chartData = data.map((group) => {
      const npsScore = group.total > 0 
        ? ((group.promoters - group.detractors) / group.total) * 100 
        : 0;
        
      return {
        name: group.dimension,
        Detractors: group.detractors,
        Passives: group.passives,
        Promoters: group.promoters,
        NPS: parseFloat(npsScore.toFixed(1))
      };
    }).sort((a, b) => b.NPS - a.NPS);
  } else {
    chartData = data.map((group) => {
      const satScore = group.total > 0 
        ? ((group.satisfied - group.unsatisfied) / group.total) * 100 
        : 0;
        
      return {
        name: group.dimension,
        Unsatisfied: group.unsatisfied,
        Neutral: group.neutral,
        Satisfied: group.satisfied,
        "Satisfaction Score": parseFloat(satScore.toFixed(1))
      };
    }).sort((a, b) => b["Satisfaction Score"] - a["Satisfaction Score"]);
  }

  return (
    <div className="space-y-8">
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
            {isNps ? (
              <>
                <Bar dataKey="Detractors" stackId="a" fill="#F44336" />
                <Bar dataKey="Passives" stackId="a" fill="#FFC107" />
                <Bar dataKey="Promoters" stackId="a" fill="#4CAF50" />
              </>
            ) : (
              <>
                <Bar dataKey="Unsatisfied" stackId="a" fill="#F44336" />
                <Bar dataKey="Neutral" stackId="a" fill="#FFC107" />
                <Bar dataKey="Satisfied" stackId="a" fill="#4CAF50" />
              </>
            )}
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
            <XAxis 
              type="number" 
              domain={[-100, 100]} 
              tickFormatter={(value) => `${value}%`} 
            />
            <YAxis
              dataKey="name"
              type="category"
              width={60}
              tick={{ fontSize: 12 }}
            />
            <Tooltip formatter={(value) => [`${value}%`, isNps ? "NPS Score" : "Satisfaction Score"]} />
            <Bar
              dataKey={isNps ? "NPS" : "Satisfaction Score"}
              fill={isNps ? "#673AB7" : "#2196F3"}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
