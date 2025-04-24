
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList, ResponsiveContainer } from "recharts";
import { NpsData } from "../types/nps";

interface NpsChartProps {
  data: NpsData;
}

export function NpsChart({ data }: NpsChartProps) {
  const getPercentage = (value: number) => {
    return Math.round((value / data.total) * 100);
  };

  const chartData = [
    {
      name: "NPS",
      Detractors: data.detractors,
      Passives: data.passives,
      Promoters: data.promoters,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Net Promoter Score</h3>
          <p className="text-sm text-muted-foreground">
            Based on {data.total} responses
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {data.nps_score}
            </div>
            <div className="text-sm text-muted-foreground">NPS Score</div>
          </div>
          {data.avg_score !== undefined && (
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {data.avg_score}
              </div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
          )}
        </div>
      </div>

      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            stackOffset="expand"
            barSize={40}
          >
            <XAxis
              type="number"
              tickFormatter={(value) => `${Math.round(value * 100)}%`}
            />
            <YAxis type="category" hide />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value} responses (${getPercentage(value)}%)`,
                name
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => `${value} (${getPercentage(data[value.toLowerCase()])}%)`}
            />
            <Bar
              name="Detractors"
              dataKey="Detractors"
              fill="#ef4444"
              stackId="stack"
            >
              <LabelList content={(props: any) => {
                const { x, y, width, value } = props;
                const percentage = getPercentage(value);
                if (percentage < 10) return null;
                return (
                  <text
                    x={x + width / 2}
                    y={y + 15}
                    textAnchor="middle"
                    fill="#fff"
                    className="text-xs font-medium"
                  >
                    {percentage}%
                  </text>
                );
              }} position="center" />
            </Bar>
            <Bar
              name="Passives"
              dataKey="Passives"
              fill="#eab308"
              stackId="stack"
            >
              <LabelList content={(props: any) => {
                const { x, y, width, value } = props;
                const percentage = getPercentage(value);
                if (percentage < 10) return null;
                return (
                  <text
                    x={x + width / 2}
                    y={y + 15}
                    textAnchor="middle"
                    fill="#fff"
                    className="text-xs font-medium"
                  >
                    {percentage}%
                  </text>
                );
              }} position="center" />
            </Bar>
            <Bar
              name="Promoters"
              dataKey="Promoters"
              fill="#22c55e"
              stackId="stack"
            >
              <LabelList content={(props: any) => {
                const { x, y, width, value } = props;
                const percentage = getPercentage(value);
                if (percentage < 10) return null;
                return (
                  <text
                    x={x + width / 2}
                    y={y + 15}
                    textAnchor="middle"
                    fill="#fff"
                    className="text-xs font-medium"
                  >
                    {percentage}%
                  </text>
                );
              }} position="center" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="font-medium text-red-600">Detractors</div>
          <div className="text-lg font-semibold">
            {data.detractors}
          </div>
          <div className="text-muted-foreground">
            responses
          </div>
        </div>
        <div>
          <div className="font-medium text-yellow-600">Passives</div>
          <div className="text-lg font-semibold">
            {data.passives}
          </div>
          <div className="text-muted-foreground">
            responses
          </div>
        </div>
        <div>
          <div className="font-medium text-green-600">Promoters</div>
          <div className="text-lg font-semibold">
            {data.promoters}
          </div>
          <div className="text-muted-foreground">
            responses
          </div>
        </div>
      </div>
    </div>
  );
}
