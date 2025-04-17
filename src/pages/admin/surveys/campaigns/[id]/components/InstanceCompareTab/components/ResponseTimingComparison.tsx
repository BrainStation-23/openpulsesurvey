
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InstanceMetrics } from "../types/instance-comparison";
import { addDays, format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ResponseTimingComparisonProps {
  baseInstance: InstanceMetrics;
  comparisonInstance: InstanceMetrics;
}

export function ResponseTimingComparison({ baseInstance, comparisonInstance }: ResponseTimingComparisonProps) {
  // Calculate daily response rates
  const calculateDailyRate = (startDate: string, endDate: string, totalResponses: number) => {
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    const dailyRate = totalResponses / days;
    
    return Array.from({ length: days }, (_, index) => ({
      date: format(addDays(new Date(startDate), index), 'MMM dd'),
      "Base Rate": index < days ? dailyRate : 0,
      "Comparison Rate": index < days ? dailyRate : 0,
    }));
  };

  const dailyData = calculateDailyRate(
    baseInstance.starts_at || '',
    baseInstance.ends_at || '',
    baseInstance.total_responses || 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Response Rate Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Base Rate" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="Comparison Rate" 
                stroke="#82ca9d" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
