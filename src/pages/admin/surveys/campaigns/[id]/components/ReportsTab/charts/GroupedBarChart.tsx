
import { useRef } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { ChartExportMenu } from "@/components/ui/chart-export-menu";
import { exportAsImage, exportAsSVG, exportAsCSV, exportAsJSON } from "@/utils/chartExport";
import type { ExportFormat } from "@/utils/chartExport";

interface GroupedBarChartProps {
  data: Array<{
    name: string;
    [key: string]: string | number;
  }>;
  keys: string[];
  colors?: string[];
  height?: number;
  title?: string;
}

export function GroupedBarChart({ 
  data, 
  keys, 
  colors = ["#3b82f6", "#22c55e", "#eab308"], 
  height = 200,
  title
}: GroupedBarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExport = async (format: ExportFormat) => {
    if (!chartRef.current) return;
    
    const fileName = `${title || 'grouped-chart'}-${new Date().toISOString().split('T')[0]}`;

    switch (format) {
      case "png":
        await exportAsImage(chartRef.current, fileName);
        break;
      case "svg":
        exportAsSVG(chartRef.current, fileName);
        break;
      case "csv":
        exportAsCSV(data, fileName);
        break;
      case "json":
        exportAsJSON(data, fileName);
        break;
    }
  };

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 z-10">
        <ChartExportMenu onExport={handleExport} />
      </div>
      <div ref={chartRef}>
        <ChartContainer config={{}}>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart 
              data={data} 
              margin={{ top: 20, right: 30, left: 20, bottom: 75 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-35} 
                textAnchor="end"
                interval={0}
                dy={10}
              />
              <YAxis allowDecimals={false} />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <ChartTooltipContent 
                      active={active} 
                      payload={payload} 
                      label={label}
                    />
                  );
                }}
              />
              {keys.map((key, index) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={colors[index % colors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
