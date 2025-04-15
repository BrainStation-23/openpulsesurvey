
import React from "react";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend, 
  ChartLegendContent 
} from "@/components/ui/chart";
import { RatingResponseData, SatisfactionData, NpsData } from "../../types/responses";
import { Bar, BarChart, Cell, Pie, PieChart, Sector } from "recharts";
import { Progress } from "@/components/ui/progress";

interface RatingQuestionViewProps {
  data: RatingResponseData | SatisfactionData | NpsData;
  isNps?: boolean;
}

export const RatingQuestionView: React.FC<RatingQuestionViewProps> = ({ data, isNps = false }) => {
  // Helper to determine data types
  const isRatingResponseData = (data: any): data is RatingResponseData => {
    return Array.isArray(data);
  };

  const isSatisfactionData = (data: any): data is SatisfactionData => {
    return !Array.isArray(data) && 'unsatisfied' in data && 'satisfied' in data;
  };

  const isNpsData = (data: any): data is NpsData => {
    return !Array.isArray(data) && 'detractors' in data && 'promoters' in data;
  };

  if (!data) return <div className="text-center text-muted-foreground">No data available</div>;

  // Render NPS data
  if (isNpsData(data)) {
    const totalResponses = data.total;
    const percentages = {
      detractors: totalResponses > 0 ? (data.detractors / totalResponses) * 100 : 0,
      passives: totalResponses > 0 ? (data.passives / totalResponses) * 100 : 0,
      promoters: totalResponses > 0 ? (data.promoters / totalResponses) * 100 : 0,
    };

    return (
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">NPS Score</div>
            <div className={`text-2xl font-bold ${data.npsScore >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data.npsScore}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Promoters */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Promoters</span>
              <span className="font-medium">
                {Math.round(percentages.promoters)}% ({data.promoters})
              </span>
            </div>
            <Progress 
              value={percentages.promoters} 
              className="bg-gray-100 h-2"
              indicatorClassName="bg-[#22c55e]"
            />
          </div>

          {/* Passives */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Passives</span>
              <span className="font-medium">
                {Math.round(percentages.passives)}% ({data.passives})
              </span>
            </div>
            <Progress 
              value={percentages.passives} 
              className="bg-gray-100 h-2"
              indicatorClassName="bg-[#eab308]"
            />
          </div>

          {/* Detractors */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Detractors</span>
              <span className="font-medium">
                {Math.round(percentages.detractors)}% ({data.detractors})
              </span>
            </div>
            <Progress 
              value={percentages.detractors} 
              className="bg-gray-100 h-2"
              indicatorClassName="bg-[#ef4444]"
            />
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Total Responses: {totalResponses}
        </div>
      </div>
    );
  }
  
  // Render Satisfaction data
  if (isSatisfactionData(data)) {
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
        </div>

        <div className="h-48">
          <ChartContainer className="h-full">
            <PieChart>
              <Pie
                data={[
                  { name: 'Unsatisfied', value: data.unsatisfied, fill: '#ef4444' },
                  { name: 'Neutral', value: data.neutral, fill: '#eab308' },
                  { name: 'Satisfied', value: data.satisfied, fill: '#22c55e' }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-medium text-red-600">Unsatisfied</div>
            <div className="text-lg font-semibold">
              {data.unsatisfied}
            </div>
            <div className="text-muted-foreground">
              responses
            </div>
          </div>
          <div>
            <div className="font-medium text-yellow-600">Neutral</div>
            <div className="text-lg font-semibold">
              {data.neutral}
            </div>
            <div className="text-muted-foreground">
              responses
            </div>
          </div>
          <div>
            <div className="font-medium text-green-600">Satisfied</div>
            <div className="text-lg font-semibold">
              {data.satisfied}
            </div>
            <div className="text-muted-foreground">
              responses
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format data for bar chart from Rating Response Data
  if (isRatingResponseData(data)) {
    if (data.length === 0) {
      return <div className="text-center text-muted-foreground">No rating data available</div>;
    }
    
    return (
      <div className="w-full h-64">
        <ChartContainer className="h-full">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <Bar dataKey="count" fill="#3b82f6">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={isNps ? getRatingColor(entry.rating) : '#3b82f6'} />
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
  }

  return <div className="text-center text-muted-foreground">Invalid data format for rating visualization</div>;
};

// Helper function to get colors for NPS ratings
function getRatingColor(rating: number): string {
  if (rating <= 6) return '#ef4444'; // Detractors - red
  if (rating <= 8) return '#eab308'; // Passives - yellow
  return '#22c55e'; // Promoters - green
}
