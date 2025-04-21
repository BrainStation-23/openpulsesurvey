
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface GroupData {
  dimension: string;
  unsatisfied: number;
  neutral: number;
  satisfied: number;
  total: number;
}

interface SatisfactionComparisonTableProps {
  data: GroupData[];
}

export function SatisfactionComparisonTable({ data }: SatisfactionComparisonTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Group</TableHead>
          <TableHead>Unsatisfied</TableHead>
          <TableHead>Neutral</TableHead>
          <TableHead>Satisfied</TableHead>
          <TableHead>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(row => (
          <TableRow key={row.dimension}>
            <TableCell>{row.dimension}</TableCell>
            <TableCell>{row.unsatisfied}</TableCell>
            <TableCell>{row.neutral}</TableCell>
            <TableCell>{row.satisfied}</TableCell>
            <TableCell>{row.total}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
