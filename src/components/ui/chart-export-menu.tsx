
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Image, FileJson, FileSpreadsheet } from "lucide-react";
import { 
  exportToCSV, 
  exportToJSON, 
  exportToPNG, 
  exportToSVG,
  formatChartDataForExport 
} from "@/lib/export/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface ChartExportMenuProps {
  data: any;
  chartType: 'bar' | 'line' | 'pie' | 'donut' | 'wordcloud' | 'boolean' | 'nps' | 'table';
  filename: string;
  className?: string;
  children: React.ReactNode;
}

export function ChartExportMenu({ 
  data, 
  chartType, 
  filename,
  className,
  children
}: ChartExportMenuProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const handleExport = async (format: 'png' | 'svg' | 'csv' | 'json') => {
    try {
      if (!chartRef.current && (format === 'png' || format === 'svg')) {
        toast({
          title: "Export failed",
          description: "Chart reference not found",
          variant: "destructive"
        });
        return;
      }
      
      const exportData = formatChartDataForExport(data, chartType);
      
      switch (format) {
        case 'png':
          await exportToPNG(chartRef.current!, filename);
          break;
        case 'svg':
          exportToSVG(chartRef.current!, filename);
          break;
        case 'csv':
          exportToCSV(exportData, filename);
          break;
        case 'json':
          exportToJSON(exportData, filename);
          break;
      }
      
      toast({
        title: "Export successful",
        description: `Chart exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error(`Error exporting chart as ${format}:`, error);
      toast({
        title: "Export failed",
        description: `Failed to export chart as ${format.toUpperCase()}`,
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className={`relative ${className || ""}`}>
      <div ref={chartRef} className="w-full h-full">
        {children}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="absolute top-2 right-2 z-10">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport('png')}>
            <Image className="h-4 w-4 mr-2" />
            Export as PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('svg')}>
            <Image className="h-4 w-4 mr-2" />
            Export as SVG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('json')}>
            <FileJson className="h-4 w-4 mr-2" />
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
