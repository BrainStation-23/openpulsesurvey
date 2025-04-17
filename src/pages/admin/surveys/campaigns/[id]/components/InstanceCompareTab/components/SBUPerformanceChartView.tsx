
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
  LineChart,
  Line
} from "recharts";
import { SBUPerformanceData } from "../types/instance-comparison";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface SBUPerformanceChartViewProps {
  data: SBUPerformanceData[];
}

export function SBUPerformanceChartView({ data }: SBUPerformanceChartViewProps) {
  const [chartTab, setChartTab] = useState("scoreComparison");

  // Sort data for score comparison chart
  const scoreComparisonData = [...data]
    .sort((a, b) => b.comparisonScore - a.comparisonScore)
    .slice(0, 10); // Top 10 SBUs by comparison score

  // Format data for rank movement chart
  const rankMovementData = [...data]
    .sort((a, b) => Math.abs(b.rankChange) - Math.abs(a.rankChange))
    .slice(0, 10); // Top 10 SBUs by absolute rank change

  // Format data for matrix chart - Add category color property
  const matrixData = data.map(item => ({
    name: item.sbu,
    x: item.baseScore,
    y: item.comparisonScore,
    z: Math.abs(item.change) * 10, // Size based on absolute change
    change: item.change,
    category: item.category,
    // Add a color property based on category
    fillColor: item.change > 0 ? "#4ade80" : item.change < 0 ? "#f87171" : "#94a3b8"
  }));

  // Custom colors for charts
  const chartColors = {
    baseScore: "#8884d8",
    comparisonScore: "#82ca9d",
    improved: "#4ade80",
    declined: "#f87171",
    unchanged: "#94a3b8"
  };

  // Custom tooltip for comparison chart
  const ComparisonTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-2 border rounded-md shadow-md text-xs">
          <p className="font-medium">{data.sbu}</p>
          <p>Base Score: {data.baseScore.toFixed(2)}</p>
          <p>Comparison Score: {data.comparisonScore.toFixed(2)}</p>
          <p className={`font-medium ${
            data.change > 0 ? 'text-green-500' : 
            data.change < 0 ? 'text-red-500' : 
            'text-muted-foreground'
          }`}>
            Change: {data.change > 0 ? '+' : ''}{data.change.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Create a custom bar renderer for the rank movement chart that handles colors
  const CustomizedBar = (props: any) => {
    const { x, y, width, height, value } = props;
    const fill = value > 0 ? chartColors.improved : value < 0 ? chartColors.declined : chartColors.unchanged;
    return <rect x={x} y={y} width={width} height={height} fill={fill} radius={4} />;
  };

  return (
    <div className="mt-6">
      <Tabs defaultValue={chartTab} onValueChange={setChartTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="scoreComparison">Score Comparison</TabsTrigger>
          <TabsTrigger value="rankMovement">Rank Movement</TabsTrigger>
          <TabsTrigger value="performanceMatrix">Performance Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="scoreComparison" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={scoreComparisonData}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="sbu" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 5]} 
                label={{ 
                  value: 'Score', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }} 
              />
              <Tooltip content={<ComparisonTooltip />} />
              <Legend />
              <Bar 
                name="Base Score" 
                dataKey="baseScore" 
                fill={chartColors.baseScore} 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                name="Comparison Score" 
                dataKey="comparisonScore" 
                fill={chartColors.comparisonScore}
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="rankMovement" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rankMovementData}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[-10, 10]} />
              <YAxis 
                dataKey="sbu" 
                type="category" 
                width={150}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Legend />
              <Bar 
                name="Rank Change" 
                dataKey="rankChange" 
                shape={<CustomizedBar />}
                radius={[4, 4, 4, 4]}
              />
              <ReferenceLine x={0} stroke="#666" />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="performanceMatrix" className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Base Score" 
                domain={[0, 5]}
                label={{ value: 'Base Score', position: 'bottom', offset: 0 }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Comparison Score" 
                domain={[0, 5]}
                label={{ value: 'Comparison Score', angle: -90, position: 'insideLeft' }}
              />
              <ZAxis 
                type="number" 
                dataKey="z" 
                range={[40, 200]} 
                name="Change Magnitude" 
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value, name) => {
                  if (name === "x") return [`${Number(value).toFixed(2)}`, "Base Score"];
                  if (name === "y") return [`${Number(value).toFixed(2)}`, "Comparison Score"];
                  return [value, name];
                }}
                labelFormatter={(label) => matrixData[label].name}
              />
              <ReferenceLine x={0} y={0} stroke="#666" />
              <ReferenceLine y="x" stroke="red" strokeDasharray="3 3" />
              <Scatter 
                name="SBUs" 
                data={matrixData}
                fill="#8884d8"
              >
                {matrixData.map((entry, index) => (
                  <cell key={`cell-${index}`} fill={entry.fillColor} />
                ))}
              </Scatter>
              <Legend />
            </ScatterChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>

      <div className="mt-4 text-xs text-muted-foreground">
        <p className="mb-1 font-medium">Chart Insights:</p>
        {chartTab === "scoreComparison" && (
          <p>Compare base and current scores for top performing SBUs. Higher bars indicate better performance.</p>
        )}
        {chartTab === "rankMovement" && (
          <p>Shows how SBU rankings changed between periods. Positive values (right) indicate improvement in rank.</p>
        )}
        {chartTab === "performanceMatrix" && (
          <p>SBUs above the diagonal line have improved scores; those below have declined. Larger circles indicate bigger changes.</p>
        )}
      </div>
    </div>
  );
}
