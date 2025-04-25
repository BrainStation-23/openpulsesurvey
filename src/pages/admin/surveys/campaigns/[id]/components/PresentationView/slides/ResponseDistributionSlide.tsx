
import { useState } from "react";
import { SlideWrapper } from "../components/SlideWrapper";
import { SlideProps } from "../types";
import { ComparisonDimension } from "../types/comparison";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ResponseDistributionProps extends SlideProps {
  campaignId: string;
  instanceId?: string;
}

export function ResponseDistributionSlide({ 
  campaign, 
  isActive,
  campaignId,
  instanceId
}: ResponseDistributionProps) {
  const [dimension, setDimension] = useState<ComparisonDimension>('sbu');
  
  const { data, isLoading } = useQuery({
    queryKey: ['response-distribution', campaignId, instanceId, dimension],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_response_distribution', {
        p_campaign_id: campaignId,
        p_instance_id: instanceId || null,
        p_dimension: dimension
      });
      
      if (error) throw error;
      return data;
    },
    enabled: isActive && !!campaignId,
    refetchOnWindowFocus: false
  });
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];
  
  const dimensions = [
    { id: 'sbu', label: 'Department' },
    { id: 'gender', label: 'Gender' },
    { id: 'location', label: 'Location' },
    { id: 'level', label: 'Level' },
    { id: 'employment_type', label: 'Employment Type' },
    { id: 'employee_type', label: 'Employee Type' }
  ];
  
  return (
    <SlideWrapper isActive={isActive} className="bg-white">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-8">Response Distribution</h2>
        
        <div className="flex mb-4 space-x-2">
          {dimensions.map(dim => (
            <button
              key={dim.id}
              className={`px-3 py-1 text-sm rounded-full ${dimension === dim.id 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setDimension(dim.id as ComparisonDimension)}
            >
              {dim.label}
            </button>
          ))}
        </div>
        
        <div className="flex flex-col lg:flex-row h-[70vh]">
          <div className="w-full lg:w-1/2 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) => 
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {data?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full lg:w-1/2 h-full p-4">
            <h3 className="text-lg font-medium mb-4">
              Distribution by {dimension.charAt(0).toUpperCase() + dimension.slice(1).replace('_', ' ')}
            </h3>
            
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b">Name</th>
                    <th className="text-right p-2 border-b">Count</th>
                    <th className="text-right p-2 border-b">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((item: any, index: number) => {
                    const total = data.reduce((sum: number, d: any) => sum + d.count, 0);
                    const percentage = (item.count / total) * 100;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-2 border-b">{item.name}</td>
                        <td className="text-right p-2 border-b">{item.count}</td>
                        <td className="text-right p-2 border-b">{percentage.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </SlideWrapper>
  );
}
