
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Building, Minus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DepartmentData {
  sbu_name: string;
  base_completion_rate: number;
  comparison_completion_rate: number;
  change: number;
}

interface DepartmentStatusTableProps {
  departmentData: DepartmentData[];
  loading?: boolean;
}

export function DepartmentStatusTable({ departmentData, loading = false }: DepartmentStatusTableProps) {
  const sortedData = [...departmentData].sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  const renderChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-500";
    if (change < 0) return "text-red-500";
    return "text-gray-500";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Department Status Changes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Department Status Changes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {departmentData.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No department data available for comparison
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">Previous</TableHead>
                <TableHead className="text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((dept, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{dept.sbu_name}</TableCell>
                  <TableCell className="text-right">{dept.base_completion_rate.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{dept.comparison_completion_rate.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {renderChangeIcon(dept.change)}
                      <span className={getChangeColor(dept.change)}>
                        {Math.abs(dept.change).toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
