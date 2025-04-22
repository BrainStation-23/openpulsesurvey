
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { exportToImage, exportToCSV, exportToJSON } from "@/lib/utils/export";

interface ChartExportMenuProps {
  data: any[];
  filename: string;
  className?: string;
}

export function ChartExportMenu({ data, filename, className }: ChartExportMenuProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExport = async (type: "png" | "svg" | "csv" | "json") => {
    if (!chartRef.current) return;

    switch (type) {
      case "png":
      case "svg":
        await exportToImage(chartRef.current, type, filename);
        break;
      case "csv":
        exportToCSV(data, filename);
        break;
      case "json":
        exportToJSON(data, filename);
        break;
    }
  };

  return (
    <div ref={chartRef} className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport("png")}>
            Export as PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("svg")}>
            Export as SVG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("csv")}>
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("json")}>
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
