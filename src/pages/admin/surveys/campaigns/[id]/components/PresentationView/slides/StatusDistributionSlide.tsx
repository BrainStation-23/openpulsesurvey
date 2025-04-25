
import { SlideProps } from "../types";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const COLORS = {
  'Submitted': '#10B981',
  'In_progress': '#3B82F6',
  'Expired': '#EF4444',
  'Assigned': '#F59E0B',
};

export function StatusDistributionSlide({ campaign, isActive }: SlideProps) {
  const { data: statusData } = useQuery({
    queryKey: ["presentation-status-distribution", campaign.id, campaign.instance?.id],
    queryFn: async () => {
      if (!campaign.instance?.id) return [];

      const { data, error } = await supabase
        .rpc('get_campaign_instance_status_distribution', {
          p_campaign_id: campaign.id,
          p_instance_id: campaign.instance.id
        });

      if (error) throw error;

      // Ensure all status types have a value
      const defaultStatuses = ['submitted', 'in_progress', 'expired', 'assigned'];
      const statusMap = new Map(data.map(item => [item.status, item.count]));
      
      return defaultStatuses.map(status => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: statusMap.get(status) || 0
      }));
    },
    enabled: !!campaign.instance?.id
  });

  if (!statusData?.length) return null;

  const total = statusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div 
      className={cn(
        "absolute inset-0 transition-opacity duration-500 ease-in-out",
        "bg-gradient-to-br from-white to-gray-50",
        "rounded-lg shadow-lg p-8",
        isActive ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="h-full flex flex-col">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Response Distribution</h2>
        <div className="flex-1 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => 
                  `${name} (${((value / total) * 100).toFixed(0)}%)`
                }
              >
                {statusData.map((entry) => (
                  <Cell 
                    key={`cell-${entry.name}`} 
                    fill={COLORS[entry.name as keyof typeof COLORS] || '#CBD5E1'}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [
                  `${value} (${((value / total) * 100).toFixed(1)}%)`,
                  'Count'
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
