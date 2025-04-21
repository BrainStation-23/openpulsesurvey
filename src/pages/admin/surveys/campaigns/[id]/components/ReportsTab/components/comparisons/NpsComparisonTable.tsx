
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface NpsComparisonTableProps {
  data: Array<{
    dimension: string,
    ratings: { rating: number, count: number }[]
  }>;
}

export function NpsComparisonTable({ data }: NpsComparisonTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Group</TableHead>
          <TableHead>Promoters</TableHead>
          <TableHead>Passives</TableHead>
          <TableHead>Detractors</TableHead>
          <TableHead>NPS Score</TableHead>
          <TableHead>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(item => {
          const total = item.ratings.reduce((acc, val) => acc + val.count, 0);
          const promoters = item.ratings.filter(r => r.rating > 8).reduce((acc, val) => acc + val.count, 0);
          const passives = item.ratings.filter(r => r.rating > 6 && r.rating <= 8).reduce((acc, val) => acc + val.count, 0);
          const detractors = item.ratings.filter(r => r.rating <= 6).reduce((acc, val) => acc + val.count, 0);
          const promotersPct = total ? (promoters / total) * 100 : 0;
          const detractorsPct = total ? (detractors / total) * 100 : 0;
          const npsScore = Math.round(promotersPct - detractorsPct);
          return (
            <TableRow key={item.dimension}>
              <TableCell>{item.dimension}</TableCell>
              <TableCell>{promoters}</TableCell>
              <TableCell>{passives}</TableCell>
              <TableCell>{detractors}</TableCell>
              <TableCell>{npsScore}</TableCell>
              <TableCell>{total}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  );
}
