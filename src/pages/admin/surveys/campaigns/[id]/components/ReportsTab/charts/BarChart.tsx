import { useRef } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartExportMenu } from "@/components/ui/chart-export-menu";
import { exportAsImage, exportAsSVG, exportAsCSV, exportAsJSON } from "@/utils/chartExport";
import type { ExportFormat } from "@/utils/chartExport";

interface BarChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  colors?: string[];
  title?: string;
}

export function BarChart({ data, colors = ["#3b82f6"], title }: BarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExport = async (format: ExportFormat) => {
    if (!chartRef.current) return;
    
    const fileName = `${title || 'chart'}-${new Date().toISOString().split('T')[0]}`;

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
          <ResponsiveContainer width="100%" height={180}>
            <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <ChartTooltip 
                cursor={false}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return <ChartTooltipContent active={active} payload={payload} />;
                }}
              />
              <Bar
                dataKey="value"
                fill={colors[0]}
                radius={[4, 4, 0, 0]}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
