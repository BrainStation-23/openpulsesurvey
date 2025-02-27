
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { LiveBarChartData } from './types';

interface LiveBarChartProps {
  data: LiveBarChartData[];
}

interface CustomLabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  payload?: {
    rating: number;
    count: number;
    percentage: number;
    timestamp: number;
  };
}

export function LiveBarChart({ data }: LiveBarChartProps) {
  const [animatedData, setAnimatedData] = useState(data);

  useEffect(() => {
    setAnimatedData(data);
  }, [data]);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={animatedData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis type="number" />
          <YAxis type="category" dataKey="rating" />
          <Bar
            dataKey="count"
            fill="#8884d8"
            animationDuration={300}
            label={{
              position: 'right',
              content: (props: CustomLabelProps) => {
                if (!props.payload || !props.x || !props.y || !props.width || !props.height) {
                  return null;
                }
                
                const percentage = props.payload.percentage.toFixed(1);
                
                return (
                  <g>
                    <text
                      x={props.x + props.width + 10}
                      y={props.y + props.height / 2}
                      textAnchor="start"
                      dominantBaseline="middle"
                      className="fill-current text-sm"
                    >
                      {props.value} ({percentage}%)
                    </text>
                  </g>
                );
              }
            }}
          >
            {animatedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`hsl(${(index * 360) / animatedData.length}, 70%, 60%)`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
