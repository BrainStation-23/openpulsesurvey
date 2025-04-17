
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface DepartmentData {
  name: string;
  base_completion: number;
  comparison_completion: number;
  change: number;
}

interface DepartmentStatusTableProps {
  departmentData: DepartmentData[];
  loading: boolean;
  error?: Error | null;
}

export function DepartmentStatusTable({ departmentData, loading, error }: DepartmentStatusTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium flex items-center">
          <Building2 className="h-5 w-5 text-purple-500" />
          <span className="ml-2">Department Completion Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size={32} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Error loading data: {error.message}</p>
          </div>
        ) : departmentData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No department data available for comparison</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Base Completion</TableHead>
                <TableHead className="text-right">Comparison Completion</TableHead>
                <TableHead className="text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentData.map((department) => (
                <TableRow key={department.name}>
                  <TableCell className="font-medium">{department.name}</TableCell>
                  <TableCell className="text-right">{(department.base_completion * 100).toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{(department.comparison_completion * 100).toFixed(1)}%</TableCell>
                  <TableCell className="text-right">
                    <span className={getChangeColor(department.change)}>
                      {department.change > 0 ? "+" : ""}
                      {(department.change * 100).toFixed(1)}%
                    </span>
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

function getChangeColor(value: number) {
  if (value > 0) return "text-green-500";
  if (value < 0) return "text-red-500";
  return "text-gray-500";
}
