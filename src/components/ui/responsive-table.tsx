
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface ResponsiveTableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ResponsiveTable({ children, className, ...props }: ResponsiveTableProps) {
  return (
    <div className={cn("relative w-full overflow-auto", className)} {...props}>
      <Table>{children}</Table>
    </div>
  );
}

ResponsiveTable.Header = TableHeader;
ResponsiveTable.Body = TableBody;
ResponsiveTable.Head = TableHead;
ResponsiveTable.Row = TableRow;
ResponsiveTable.Cell = TableCell;

export { ResponsiveTable };
