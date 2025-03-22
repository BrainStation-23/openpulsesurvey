
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Objective, ObjectiveStatus } from '@/types/okr';
import { formatStatus } from './StatusBadge';

interface StatusPieChartProps {
  objectives: Objective[];
}

export const StatusPieChart = ({ objectives }: StatusPieChartProps) => {
  const statusCounts = getStatusCounts(objectives);
  const statusData = getStatusData(statusCounts);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Objective Status</CardTitle>
        <CardDescription>Distribution of objectives by status</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStatusColor(entry.id)} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} objectives`, 'Count']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Helper functions
const getStatusCounts = (objectives: Objective[]) => {
  return objectives.reduce((acc, obj) => {
    acc[obj.status] = (acc[obj.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

const getStatusData = (statusCounts: Record<string, number>) => {
  return Object.entries(statusCounts).map(([key, value]) => ({
    id: key,
    name: formatStatus(key as ObjectiveStatus),
    value
  }));
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'draft': return '#CBD5E1';
    case 'in_progress': return '#FCD34D';
    case 'at_risk': return '#EF4444';
    case 'on_track': return '#3B82F6';
    case 'completed': return '#10B981';
    default: return '#CBD5E1';
  }
};
