import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserMinus, AlertCircle } from "lucide-react";
import { format } from "date-fns";

type SilentEmployee = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  designation: string | null;
  level: string | null;
  location: string | null;
  sbu_name: string | null;
  total_responses: number;
  last_response_date: string | null;
  total_assignments: number;
  participation_status: string;
};

export function SilentEmployees() {
  const { data: silentEmployees, isLoading } = useQuery({
    queryKey: ["silent-employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("silent_employees")
        .select("*");

      if (error) throw error;

      return data as SilentEmployee[];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserMinus className="h-5 w-5 text-destructive" />
            Silent Employees
          </CardTitle>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserMinus className="h-5 w-5 text-destructive" />
          Silent Employees
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Assignments</TableHead>
              <TableHead className="text-right">Last Response</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {silentEmployees?.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {employee.first_name} {employee.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {employee.designation || "No designation"}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{employee.sbu_name || "Unassigned"}</div>
                    <div className="text-sm text-muted-foreground">
                      {employee.location || "No location"}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {employee.participation_status}
                  </div>
                </TableCell>
                <TableCell className="text-right">{employee.total_assignments}</TableCell>
                <TableCell className="text-right">
                  {employee.last_response_date
                    ? format(new Date(employee.last_response_date), "MMM d, yyyy")
                    : "Never"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}