
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Objective } from '@/types/okr';

interface ProgressBarChartProps {
  objectives: Objective[];
}

export const ProgressBarChart = ({ objectives }: ProgressBarChartProps) => {
  const progressDistribution = getProgressDistribution(objectives);
  const progressData = getProgressData(progressDistribution);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Distribution</CardTitle>
        <CardDescription>Objective progress breakdown</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} objectives`, 'Count']} />
            <Legend />
            <Bar dataKey="value" name="Objectives" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Helper functions
const getProgressDistribution = (objectives: Objective[]) => {
  const distribution = {
    '0-25': 0,
    '26-50': 0,
    '51-75': 0,
    '76-99': 0,
    '100': 0
  };
  
  objectives.forEach(obj => {
    if (obj.progress === 100) {
      distribution['100']++;
    } else if (obj.progress >= 76) {
      distribution['76-99']++;
    } else if (obj.progress >= 51) {
      distribution['51-75']++;
    } else if (obj.progress >= 26) {
      distribution['26-50']++;
    } else {
      distribution['0-25']++;
    }
  });
  
  return distribution;
};

const getProgressData = (progressDistribution: Record<string, number>) => {
  return Object.entries(progressDistribution).map(([key, value]) => ({
    name: key + '%',
    value
  }));
};
