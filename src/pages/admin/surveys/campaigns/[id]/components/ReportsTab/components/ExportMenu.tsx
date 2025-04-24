
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportAsImage, exportAsPDF, exportAsCSV, exportAsExcel } from "../utils/exportUtils";

interface ExportMenuProps {
  chartId: string;
  fileName: string;
  data: any[];
}

export function ExportMenu({ chartId, fileName, data }: ExportMenuProps) {
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
        <DropdownMenuItem onClick={() => exportAsCSV(data, fileName)}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportAsExcel(data, fileName)}>
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
