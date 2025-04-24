
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

interface SentimentData {
  name: string;
  sentiment: number;
  count: number;
}

interface SentimentAnalysisChartProps {
  data: SentimentData[];
}

export function SentimentAnalysisChart({ data }: SentimentAnalysisChartProps) {
  // Calculate sentiment categories
  const sentimentCategories = data.map(item => {
    const score = item.sentiment;
    let category;
    
    if (score >= 80) category = "Positive";
    else if (score >= 60) category = "Neutral";
    else category = "Negative";
    
    return {
      name: item.name,
      category,
      value: item.count
    };
  });
  
  // Count by category
  const sentimentCounts = sentimentCategories.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.value;
    return acc;
  }, {} as Record<string, number>);
  
  // Format for pie chart
  const pieData = Object.entries(sentimentCounts).map(([name, value]) => ({ name, value }));
  
  // Colors for sentiment categories
  const COLORS = {
    "Positive": "#4ade80",  // Green
    "Neutral": "#f59e0b",   // Amber
    "Negative": "#ef4444"   // Red
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 5, right: 5, bottom: 30, left: 5 }}>
        <Pie
          data={pieData}
          cx="50%"
          cy="45%"
          labelLine={false}
          outerRadius={65}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {pieData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[entry.name as keyof typeof COLORS] || "#8884d8"} 
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`${value} responses`, "Count"]}
        />
        <Legend 
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          content={renderCustomizedLegend}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Custom legend that prevents overflow
const renderCustomizedLegend = (props: any) => {
  const { payload } = props;

  if (!payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-2 px-1 max-w-full overflow-hidden">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center">
          <div
            className="w-3 h-3 mr-1 rounded-sm flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};
