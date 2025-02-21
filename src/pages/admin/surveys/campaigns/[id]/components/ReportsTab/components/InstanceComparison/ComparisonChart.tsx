
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface ComparisonChartProps {
  data: Array<{
    question: string;
    base: number;
    comparison: number;
  }>;
  title: string;
  baseLabel: string;
  comparisonLabel: string;
}

export function ComparisonChart({ data, title, baseLabel, comparisonLabel }: ComparisonChartProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="question" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="base" name={baseLabel} fill="#4f46e5" />
              <Bar dataKey="comparison" name={comparisonLabel} fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
