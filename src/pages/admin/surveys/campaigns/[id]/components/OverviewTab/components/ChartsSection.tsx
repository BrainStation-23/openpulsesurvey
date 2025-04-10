
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart } from "lucide-react";
import { TopPerformingSBUsChart } from "./TopPerformingSBUsChart";
import { TopPerformingManagersChart } from "./TopPerformingManagersChart";

interface ChartsSectionProps {
  responseData: any[] | undefined;
  statusData: any[] | undefined;
  campaignId: string;
  selectedInstanceId?: string;
}

export function ChartsSection({ 
  responseData,
  statusData,
  campaignId,
  selectedInstanceId
}: ChartsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {statusData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-blue-500" />
                Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {/* Status distribution chart would go here */}
              {statusData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No data available for status distribution.
                </div>
              ) : (
                <div className="text-center py-8">
                  Status data available: {statusData.length} entries
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {responseData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-blue-500" />
                Response Over Time
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              {/* Response over time chart would go here */}
              {responseData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No data available for responses over time.
                </div>
              ) : (
                <div className="text-center py-8">
                  Response data available: {responseData.length} entries
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-blue-500" />
              SBU Response Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {/* SBU Response Rates would go here */}
            <div className="text-center py-8 text-muted-foreground">
              SBU Response data visualization
            </div>
          </CardContent>
        </Card>
        <div />
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <TopPerformingSBUsChart 
          campaignId={campaignId}
          instanceId={selectedInstanceId}
        />
        <TopPerformingManagersChart
          campaignId={campaignId}
          instanceId={selectedInstanceId}
        />
      </div>
    </div>
  );
}
