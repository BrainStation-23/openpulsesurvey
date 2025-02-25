
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { LivePieChartData } from './types';

interface LivePieChartProps {
  data: LivePieChartData[];
  total: number;
}

export function LivePieChart({ data, total }: LivePieChartProps) {
  const [animatedData, setAnimatedData] = useState(data);

  useEffect(() => {
    setAnimatedData(data);
  }, [data]);

  const COLORS = ['#0088FE', '#FF8042'];

  return (
    <div className="w-full h-[400px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={animatedData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="count"
            animationDuration={300}
          >
            {animatedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <Label
              content={({ viewBox: { cx, cy } }) => (
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-current font-medium"
                >
                  <tspan x={cx} dy="-1em" className="text-2xl">
                    {total}
                  </tspan>
                  <tspan x={cx} dy="1.5em" className="text-sm text-muted-foreground">
                    Total Responses
                  </tspan>
                </text>
              )}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
