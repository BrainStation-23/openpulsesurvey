
import { Button } from "@/components/ui/button";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";

interface ConfigTableHeaderProps {
  draggable?: boolean;
  onSort?: () => void;
}

export function ConfigTableHeader({ draggable, onSort }: ConfigTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        {draggable && <TableHead style={{ width: '40px' }}></TableHead>}
        <TableHead className="w-[300px]">
          {onSort ? (
            <Button variant="ghost" onClick={onSort} className="flex items-center gap-1 p-0">
              Name
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          ) : (
            "Name"
          )}
        </TableHead>
        <TableHead className="w-[100px]">Status</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
