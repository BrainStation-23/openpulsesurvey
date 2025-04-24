
import { useRef } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts";
import { ChartExportMenu } from "@/components/ui/chart-export-menu";
import { exportAsImage, exportAsSVG, exportAsCSV, exportAsJSON } from "@/utils/chartExport";
import type { ExportFormat } from "@/utils/chartExport";

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  colors?: string[];
  title?: string;
}

export function DonutChart({ data, colors = ["#3b82f6", "#22c55e", "#eab308", "#ef4444"], title }: DonutChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExport = async (format: ExportFormat) => {
    if (!chartRef.current) return;
    
    const fileName = `${title || 'donut-chart'}-${new Date().toISOString().split('T')[0]}`;

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
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return <ChartTooltipContent active={active} payload={payload} />;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
