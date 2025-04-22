
import { CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartExportMenu } from "@/components/ui/chart-export-menu";

interface SatisfactionDonutChartProps {
  data: {
    unsatisfied: number;
    neutral: number;
    satisfied: number;
    total: number;
    median: number;
  };
  questionTitle?: string;
}

export function SatisfactionDonutChart({ data, questionTitle = "Question" }: SatisfactionDonutChartProps) {
  const pieData = [
    { name: "Unsatisfied", value: data.unsatisfied },
    { name: "Neutral", value: data.neutral },
    { name: "Satisfied", value: data.satisfied },
  ];

  const COLORS = ["#ef4444", "#f59e0b", "#22c55e"];
  
  const totalResponses = data.total;
  const satisfiedPercentage = Math.round((data.satisfied / totalResponses) * 100) || 0;
  const neutralPercentage = Math.round((data.neutral / totalResponses) * 100) || 0;
  const unsatisfiedPercentage = Math.round((data.unsatisfied / totalResponses) * 100) || 0;

  const filename = `${questionTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_satisfaction`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-muted rounded-lg p-4 text-center">
          <div className="text-3xl font-bold">{data.median.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">Median Score</div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-red-100 rounded-lg p-2">
            <div className="text-red-600 font-medium">{unsatisfiedPercentage}%</div>
            <div className="text-xs text-muted-foreground">Unsatisfied</div>
          </div>
          <div className="bg-amber-100 rounded-lg p-2">
            <div className="text-amber-600 font-medium">{neutralPercentage}%</div>
            <div className="text-xs text-muted-foreground">Neutral</div>
          </div>
          <div className="bg-green-100 rounded-lg p-2">
            <div className="text-green-600 font-medium">{satisfiedPercentage}%</div>
            <div className="text-xs text-muted-foreground">Satisfied</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <ChartExportMenu data={pieData} chartType="donut" filename={filename}>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-muted-foreground">Category:</div>
                            <div>{payload[0].name}</div>
                            <div className="text-muted-foreground">Count:</div>
                            <div>{payload[0].value}</div>
                            <div className="text-muted-foreground">Percentage:</div>
                            <div>{((Number(payload[0].value) / totalResponses) * 100).toFixed(1)}%</div>
                          </div>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartExportMenu>
        </TabsContent>

        <TabsContent value="table">
          <ChartExportMenu data={pieData} chartType="table" filename={filename}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pieData.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right">{item.value}</TableCell>
                    <TableCell className="text-right">
                      {((item.value / totalResponses) * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ChartExportMenu>
        </TabsContent>
      </Tabs>
    </div>
  );
}
