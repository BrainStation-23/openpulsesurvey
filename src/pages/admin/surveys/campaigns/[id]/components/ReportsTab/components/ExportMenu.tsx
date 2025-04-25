
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportAsImage, exportAsPDF, exportAsCSV, exportAsExcel } from "../utils/exportUtils";
import { transformBooleanData, transformNpsData, transformSatisfactionData } from "../utils/exportDataTransform";

interface ExportMenuProps {
  chartId: string;
  fileName: string;
  data: any[];
  isComparison?: boolean;
  isNps?: boolean;
  isBoolean?: boolean;
}

export function ExportMenu({ 
  chartId, 
  fileName, 
  data,
  isComparison = false,
  isNps = false,
  isBoolean = false 
}: ExportMenuProps) {
  const getExportData = () => {
    if (!isComparison) return data;

    if (isBoolean) {
      return transformBooleanData(data);
    } else if (isNps) {
      return transformNpsData(data);
    } else {
      return transformSatisfactionData(data);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => exportAsImage(chartId, fileName)}>
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportAsPDF(chartId, fileName)}>
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportAsCSV(getExportData(), fileName)}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportAsExcel(getExportData(), fileName)}>
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
