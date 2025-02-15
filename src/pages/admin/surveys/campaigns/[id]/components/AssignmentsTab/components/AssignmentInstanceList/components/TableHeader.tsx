
import { Checkbox } from "@/components/ui/checkbox";
import {
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
  Tooltip,
} from "@/components/ui/tooltip";

interface TableHeaderProps {
  table: any;
  onSelectAll: (value: boolean) => void;
}

export function TableHeader({ table, onSelectAll }: TableHeaderProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center space-x-2 px-2 py-1 bg-gray-50 rounded-md border">
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) => {
                table.toggleAllPageRowsSelected(!!value);
                onSelectAll(!!value);
              }}
            />
            <span className="text-sm text-gray-700">Select All</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Select all assignments on this page</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
