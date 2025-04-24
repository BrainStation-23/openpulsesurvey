
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, BarChart3, PieChart, LineChart } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function CampaignPerformance() {
  const { id } = useParams();

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('survey_campaigns')
        .select(`
          *,
          survey:surveys(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2"
            >
              <Link to="/admin/surveys/campaigns">
                <ChevronLeft className="h-4 w-4" />
                Back to Campaigns
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold">{campaign?.name} Performance</h1>
          <p className="text-muted-foreground">
            Analyze campaign performance across all instances
          </p>
        </div>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Response Trends</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder for charts */}
            <div className="border rounded-lg p-4 h-[300px] flex flex-col items-center justify-center">
              <LineChart className="h-8 w-8 mb-2 text-muted-foreground" />
              <h3 className="font-medium">Response Rate Over Time</h3>
            </div>
            <div className="border rounded-lg p-4 h-[300px] flex flex-col items-center justify-center">
              <BarChart3 className="h-8 w-8 mb-2 text-muted-foreground" />
              <h3 className="font-medium">Completion Rate Progress</h3>
            </div>
            <div className="border rounded-lg p-4 h-[300px] flex flex-col items-center justify-center">
              <BarChart3 className="h-8 w-8 mb-2 text-muted-foreground" />
              <h3 className="font-medium">Response Volume</h3>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="demographics">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {/* Placeholder for demographic charts */}
            <div className="border rounded-lg p-4 h-[300px] flex flex-col items-center justify-center">
              <PieChart className="h-8 w-8 mb-2 text-muted-foreground" />
              <h3 className="font-medium">Department Distribution</h3>
            </div>
            <div className="border rounded-lg p-4 h-[300px] flex flex-col items-center justify-center">
              <PieChart className="h-8 w-8 mb-2 text-muted-foreground" />
              <h3 className="font-medium">Location Distribution</h3>
            </div>
            <div className="border rounded-lg p-4 h-[300px] flex flex-col items-center justify-center">
              <PieChart className="h-8 w-8 mb-2 text-muted-foreground" />
              <h3 className="font-medium">Employee Type Distribution</h3>
            </div>
            <div className="border rounded-lg p-4 h-[300px] flex flex-col items-center justify-center">
              <BarChart3 className="h-8 w-8 mb-2 text-muted-foreground" />
              <h3 className="font-medium">Participation Rate</h3>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Placeholder for comparison charts */}
            <div className="border rounded-lg p-4 h-[300px] flex flex-col items-center justify-center">
              <BarChart3 className="h-8 w-8 mb-2 text-muted-foreground" />
              <h3 className="font-medium">Instance Comparison</h3>
            </div>
            <div className="border rounded-lg p-4 h-[300px] flex flex-col items-center justify-center">
              <LineChart className="h-8 w-8 mb-2 text-muted-foreground" />
              <h3 className="font-medium">Period Analysis</h3>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
