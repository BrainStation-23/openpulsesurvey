
import { CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartExportMenu } from "@/components/ui/chart-export-menu";

interface NpsChartProps {
  data: Array<{
    rating: number;
    count: number;
  }>;
  questionTitle?: string;
}

export function NpsChart({ data, questionTitle = "Question" }: NpsChartProps) {
  const npsCategories = (rating: number) => {
    if (rating <= 6) return "Detractors";
    if (rating <= 8) return "Passives";
    return "Promoters";
  };

  const colorByRating = (rating: number) => {
    if (rating <= 6) return "#ef4444"; // red
    if (rating <= 8) return "#f59e0b"; // amber
    return "#22c55e"; // green
  };

  // Calculate NPS score
  const totalResponses = data.reduce((sum, item) => sum + item.count, 0);
  const promoters = data.filter(item => item.rating >= 9).reduce((sum, item) => sum + item.count, 0);
  const detractors = data.filter(item => item.rating <= 6).reduce((sum, item) => sum + item.count, 0);
  
  let npsScore = 0;
  if (totalResponses > 0) {
    npsScore = Math.round(((promoters / totalResponses) - (detractors / totalResponses)) * 100);
  }

  // Prepare category data for export
  const categoryData = [
    { category: "Detractors (0-6)", count: detractors, percentage: `${Math.round((detractors / totalResponses) * 100)}%` },
    { category: "Passives (7-8)", count: data.filter(item => item.rating >= 7 && item.rating <= 8).reduce((sum, item) => sum + item.count, 0), percentage: `${Math.round((data.filter(item => item.rating >= 7 && item.rating <= 8).reduce((sum, item) => sum + item.count, 0) / totalResponses) * 100)}%` },
    { category: "Promoters (9-10)", count: promoters, percentage: `${Math.round((promoters / totalResponses) * 100)}%` }
  ];

  const filename = `${questionTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_nps_responses`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-muted rounded-lg p-4 text-center">
          <div className="text-4xl font-bold">{npsScore}</div>
          <div className="text-sm text-muted-foreground">NPS Score</div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-red-100 rounded-lg p-2">
            <div className="text-red-600 font-medium">
              {Math.round((detractors / totalResponses) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Detractors</div>
          </div>
          <div className="bg-amber-100 rounded-lg p-2">
            <div className="text-amber-600 font-medium">
              {Math.round((data.filter(item => item.rating >= 7 && item.rating <= 8).reduce((sum, item) => sum + item.count, 0) / totalResponses) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Passives</div>
          </div>
          <div className="bg-green-100 rounded-lg p-2">
            <div className="text-green-600 font-medium">
              {Math.round((promoters / totalResponses) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Promoters</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <ChartExportMenu data={data} chartType="nps" filename={filename}>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const rating = payload[0].payload.rating;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-muted-foreground">Rating:</div>
                            <div>{rating}</div>
                            <div className="text-muted-foreground">Count:</div>
                            <div>{payload[0].value}</div>
                            <div className="text-muted-foreground">Category:</div>
                            <div>{npsCategories(rating)}</div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.map((entry) => (
                      <Cell key={`cell-${entry.rating}`} fill={colorByRating(entry.rating)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartExportMenu>
        </TabsContent>

        <TabsContent value="table">
          <ChartExportMenu data={data} chartType="table" filename={filename}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rating</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.rating}>
                    <TableCell>{item.rating}</TableCell>
                    <TableCell>{npsCategories(item.rating)}</TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
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
