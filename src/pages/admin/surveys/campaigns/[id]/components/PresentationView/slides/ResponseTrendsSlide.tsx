
import { useState, useMemo } from "react";
import { SlideWrapper } from "../components/SlideWrapper";
import { SlideProps } from "../types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function ResponseTrendsSlide({ campaign, isActive }: SlideProps) {
  const [metric, setMetric] = useState<'completion_rate' | 'responses_per_day'>('completion_rate');
  
  const { data: instanceData } = useQuery({
    queryKey: ['response-trends', campaign.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_instances')
        .select('id, period_number, starts_at, ends_at, completion_rate')
        .eq('campaign_id', campaign.id)
        .order('period_number', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: isActive && !!campaign.id,
    refetchOnWindowFocus: false
  });
  
  const { data: responseData } = useQuery({
    queryKey: ['response-daily', campaign.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_daily_responses', {
        p_campaign_id: campaign.id
      });
      
      if (error) throw error;
      return data;
    },
    enabled: isActive && !!campaign.id && metric === 'responses_per_day',
    refetchOnWindowFocus: false
  });
  
  const chartData = useMemo(() => {
    if (metric === 'completion_rate' && instanceData) {
      return instanceData.map(instance => ({
        name: `Period ${instance.period_number}`,
        value: instance.completion_rate || 0
      }));
    } else if (metric === 'responses_per_day' && responseData) {
      return responseData.map((item: any) => ({
        name: new Date(item.date).toLocaleDateString(),
        value: item.count
      }));
    }
    return [];
  }, [metric, instanceData, responseData]);
  
  return (
    <SlideWrapper isActive={isActive} className="bg-white">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-8">Response Trends</h2>
        
        <div className="flex mb-4 space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded-full ${metric === 'completion_rate' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setMetric('completion_rate')}
          >
            Completion Rate by Period
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-full ${metric === 'responses_per_day' 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setMetric('responses_per_day')}
          >
            Responses Per Day
          </button>
        </div>
        
        <div className="h-[70vh]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 50,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80}
              />
              <YAxis
                label={
                  metric === 'completion_rate' 
                    ? { value: 'Completion Rate (%)', angle: -90, position: 'insideLeft' }
                    : { value: 'Number of Responses', angle: -90, position: 'insideLeft' }
                }
                domain={metric === 'completion_rate' ? [0, 100] : undefined}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                name={metric === 'completion_rate' ? 'Completion Rate (%)' : 'Responses'}
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SlideWrapper>
  );
}
