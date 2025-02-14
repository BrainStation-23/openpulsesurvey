
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { SlideWrapper } from "../components/SlideWrapper";
import { CampaignData } from "../types";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function ResponseDistributionSlide({ 
  campaignId, 
  instanceId,
  isActive,
  campaign
}: { 
  campaignId: string;
  instanceId?: string;
  isActive: boolean;
  campaign: CampaignData;
}) {
  const { data: distributionData } = useQuery({
    queryKey: ["response-distribution", campaignId, instanceId],
    queryFn: async () => {
      if (!instanceId) return [];

      const { data: assignments } = await supabase
        .from("survey_assignments")
        .select("id")
        .eq("campaign_id", campaignId);

      if (!assignments?.length) return [];

      const statusCounts: Record<string, number> = {};

      await Promise.all(
        assignments.map(async (assignment) => {
          const { data: status } = await supabase
            .rpc('get_instance_assignment_status', {
              p_assignment_id: assignment.id,
              p_instance_id: instanceId
            });
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        })
      );

      return Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value
      }));
    },
    enabled: !!campaignId && !!instanceId
  });

  if (!distributionData?.length) return null;

  return (
    <SlideWrapper isActive={isActive} campaign={campaign}>
      <Card className="w-full h-full flex items-center justify-center p-4">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={distributionData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              label
            >
              {distributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </SlideWrapper>
  );
}
