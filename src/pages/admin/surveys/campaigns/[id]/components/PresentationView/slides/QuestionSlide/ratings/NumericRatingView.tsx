
import React from "react";
import { 
  ChartContainer, 
  ChartTooltip
} from "@/components/ui/chart";
import { RatingResponseData } from "../../../types/responses";
import { Bar, BarChart, Cell } from "recharts";

interface NumericRatingViewProps {
  data: RatingResponseData;
  isNps?: boolean;
}

export const NumericRatingView: React.FC<NumericRatingViewProps> = ({ data, isNps = false }) => {
  if (data.length === 0) {
    return <div className="text-center text-muted-foreground">No rating data available</div>;
  }
  
  return (
    <div className="w-full h-64">
      <ChartContainer 
        className="h-full" 
        config={{
          count: { 
            color: "#3b82f6",
            label: "Response Count"
          }
        }}
      >
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <Bar dataKey="count" fill="#3b82f6">
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={isNps ? getRatingColor(entry.rating) : '#3b82f6'} 
              />
            ))}
          </Bar>
          <ChartTooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Rating:</div>
                      <div>{data.rating}</div>
                      <div className="font-medium">Count:</div>
                      <div>{data.count}</div>
                    </div>
                  </div>
                );
              }
              return null;
            }} 
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

function getRatingColor(rating: number): string {
  if (rating <= 6) return '#ef4444'; // Detractors - red
  if (rating <= 8) return '#eab308'; // Passives - yellow
  return '#22c55e'; // Promoters - green
}
