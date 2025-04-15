
import React from "react";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartLegend, 
  ChartLegendContent 
} from "@/components/ui/chart";
import { SatisfactionData } from "../../../types/responses";
import { Pie, PieChart } from "recharts";

interface SatisfactionRatingViewProps {
  data: SatisfactionData;
}

export const SatisfactionRatingView: React.FC<SatisfactionRatingViewProps> = ({ data }) => {
  const avgScore = ((data.satisfied * 5 + data.neutral * 3 + data.unsatisfied * 1) / data.total).toFixed(1);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            {Math.round((data.satisfied / data.total) * 100)}%
          </div>
          <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {data.median.toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground">Median Score</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">
            {avgScore}
          </div>
          <div className="text-sm text-muted-foreground">Average Score</div>
        </div>
      </div>

      <div className="h-[400px] flex items-center justify-center">
        <ChartContainer 
          className="h-full w-full max-w-[600px]"
          config={{
            satisfied: { color: "#22c55e" },
            neutral: { color: "#eab308" },
            unsatisfied: { color: "#ef4444" }
          }}
        >
          <PieChart>
            <Pie
              data={[
                { name: 'Unsatisfied', value: data.unsatisfied, fill: '#ef4444' },
                { name: 'Neutral', value: data.neutral, fill: '#eab308' },
                { name: 'Satisfied', value: data.satisfied, fill: '#22c55e' }
              ]}
              cx="50%"
              cy="50%"
              outerRadius={160}
              innerRadius={80}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={true}
            />
            <ChartTooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium">{data.name}:</div>
                        <div>{data.value} responses</div>
                        <div className="font-medium">Percentage:</div>
                        <div>{((data.value / (data.total || 1)) * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="font-medium text-red-600">Unsatisfied</div>
          <div className="text-lg font-semibold">{data.unsatisfied}</div>
          <div className="text-muted-foreground">responses</div>
        </div>
        <div>
          <div className="font-medium text-yellow-600">Neutral</div>
          <div className="text-lg font-semibold">{data.neutral}</div>
          <div className="text-muted-foreground">responses</div>
        </div>
        <div>
          <div className="font-medium text-green-600">Satisfied</div>
          <div className="text-lg font-semibold">{data.satisfied}</div>
          <div className="text-muted-foreground">responses</div>
        </div>
      </div>
    </div>
  );
};
