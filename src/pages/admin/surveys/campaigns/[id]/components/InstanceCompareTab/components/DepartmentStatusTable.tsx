
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { DepartmentData } from "../hooks/useDepartmentComparison";

interface DepartmentStatusTableProps {
  departmentData: DepartmentData[];
  loading: boolean;
  error: Error | null;
}

export function DepartmentStatusTable({
  departmentData,
  loading,
  error
}: DepartmentStatusTableProps) {
  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="w-full h-12" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading department data: {error.message}
          </AlertDescription>
        </Alert>
      );
    }

    if (!departmentData.length) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No department data available for comparison.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-2 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Department
              </th>
              <th className="px-2 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Base
              </th>
              <th className="px-2 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Comparison
              </th>
              <th className="px-2 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Change
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted">
            {departmentData.map((dept, index) => (
              <tr key={index} className="hover:bg-muted/50">
                <td className="px-2 py-3 text-sm">{dept.name}</td>
                <td className="px-2 py-3 text-sm text-right">{dept.base_completion.toFixed(1)}%</td>
                <td className="px-2 py-3 text-sm text-right">{dept.comparison_completion.toFixed(1)}%</td>
                <td className="px-2 py-3 text-sm text-right">
                  <span
                    className={
                      dept.change > 0
                        ? "text-green-600"
                        : dept.change < 0
                        ? "text-red-600"
                        : ""
                    }
                  >
                    {dept.change > 0 ? "+" : ""}
                    {dept.change.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Department Completion Rates</CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
