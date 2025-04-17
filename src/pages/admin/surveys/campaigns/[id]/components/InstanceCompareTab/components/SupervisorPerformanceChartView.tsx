
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupervisorPerformer, ChartViewType } from "../types/instance-comparison";
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
  Cell,
  ReferenceLine,
  AreaChart,
  Area
} from "recharts";
import { BarChart3, PieChart, LineChart, ArrowLeftRight } from "lucide-react";

interface SupervisorPerformanceChartViewProps {
  data: SupervisorPerformer[];
}

export function SupervisorPerformanceChartView({ data }: SupervisorPerformanceChartViewProps) {
  const [chartTab, setChartTab] = useState<ChartViewType>("distribution");

  // Sort for distribution chart - top performers by current score
  const distributionData = [...data]
    .sort((a, b) => b.comparison_score - a.comparison_score)
    .slice(0, 15); // Top 15 supervisors

  // Sort for movement chart - biggest movers (both improved and declined)
  const movementData = [...data]
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 10); // Top 10 supervisors by absolute change

  // Format data for matrix chart
  const matrixData = data.map(item => ({
    name: item.name,
    x: item.base_score,
    y: item.comparison_score,
    z: Math.abs(item.change) * 10, // Size based on absolute change
    change: item.change,
    category: item.category
  }));

  // Create timeline data (simulated)
  const timelineData = distributionData.map(supervisor => {
    // Create points between base and comparison score to simulate a timeline
    const midPoint = (supervisor.base_score + supervisor.comparison_score) / 2;
    const variance = Math.random() * 0.5 - 0.25; // Random variance for the middle point
    
    return [
      { name: supervisor.name, period: 'Base', score: supervisor.base_score },
      { name: supervisor.name, period: 'Mid', score: midPoint + variance },
      { name: supervisor.name, period: 'Current', score: supervisor.comparison_score }
    ];
  }).flat();

  // Chart colors
  const chartColors = {
    improved: "#4ade80", // green
    declined: "#f87171", // red
    stable: "#94a3b8",   // slate
    primary: "#8884d8",  // purple
    secondary: "#82ca9d" // teal
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-semibold">{payload[0].payload.name || label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} style={{ color: item.color }}>
              {item.name}: {item.value.toFixed(2)}
            </p>
          ))}
          {payload[0].payload.change !== undefined && (
            <p className={payload[0].payload.change > 0 ? "text-green-600" : payload[0].payload.change < 0 ? "text-red-600" : ""}>
              Change: {payload[0].payload.change > 0 ? "+" : ""}{payload[0].payload.change.toFixed(2)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Create a custom bar renderer for the rank movement chart that handles colors
  const CustomizedBar = (props: any) => {
    const { x, y, width, height, value } = props;
    const fill = value > 0 ? chartColors.improved : value < 0 ? chartColors.declined : chartColors.stable;
    return <rect x={x} y={y} width={width} height={height} fill={fill} radius={4} />;
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue={chartTab} onValueChange={(value) => setChartTab(value as ChartViewType)}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="distribution" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            <span>Distribution</span>
          </TabsTrigger>
          <TabsTrigger value="movement" className="flex items-center gap-1">
            <ArrowLeftRight className="h-4 w-4" />
            <span>Rank Movement</span>
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center gap-1">
            <PieChart className="h-4 w-4" />
            <span>Performance Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-1">
            <LineChart className="h-4 w-4" />
            <span>Timeline</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution by Supervisor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 5]} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={150}
                      tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      name="Base Score" 
                      dataKey="base_score" 
                      fill={chartColors.secondary} 
                      barSize={15} 
                    />
                    <Bar 
                      name="Current Score" 
                      dataKey="comparison_score" 
                      fill={chartColors.primary} 
                      barSize={15} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movement">
          <Card>
            <CardHeader>
              <CardTitle>Top Movers by Score Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={movementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                    />
                    <YAxis domain={[-2, 2]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      name="Score Change" 
                      dataKey="change" 
                      shape={<CustomizedBar />}
                      radius={[4, 4, 4, 4]} 
                    />
                    <ReferenceLine y={0} stroke="#666" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix">
          <Card>
            <CardHeader>
              <CardTitle>Performance Matrix (Base vs Current)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Base Score" 
                      domain={[0, 5]}
                      label={{ value: 'Base Score', position: 'bottom' }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Current Score" 
                      domain={[0, 5]}
                      label={{ value: 'Current Score', angle: -90, position: 'left' }}
                    />
                    <ZAxis type="number" dataKey="z" range={[50, 500]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <ReferenceLine x={0} stroke="#666" />
                    <ReferenceLine y={0} stroke="#666" />
                    <ReferenceLine y={45} stroke="red" strokeDasharray="3 3" />
                    <Scatter 
                      name="Supervisors" 
                      data={matrixData} 
                      fill="#8884d8"
                    >
                      {matrixData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.change > 0 ? chartColors.improved : entry.change < 0 ? chartColors.declined : chartColors.stable} 
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {distributionData.slice(0, 5).map((supervisor, index) => (
                      <Area
                        key={index}
                        type="monotone"
                        dataKey="score"
                        name={supervisor.name}
                        data={timelineData.filter(item => item.name === supervisor.name)}
                        stroke={`hsl(${index * 60}, 70%, 50%)`}
                        fill={`hsl(${index * 60}, 70%, 90%)`}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
