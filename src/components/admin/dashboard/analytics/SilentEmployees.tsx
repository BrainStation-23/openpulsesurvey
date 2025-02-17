
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserMinus, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
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

  // Mobile card view
  if (isMobile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserMinus className="h-5 w-5 text-destructive" />
            Silent Employees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {silentEmployees?.map((employee) => (
              <Card key={employee.id}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {employee.designation || "No designation"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        {employee.participation_status}
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        Department: {employee.sbu_name || "Unassigned"}
                      </p>
                      <p className="text-muted-foreground">
                        Location: {employee.location || "No location"}
                      </p>
                      <p className="text-muted-foreground">
                        Assignments: {employee.total_assignments}
                      </p>
                      <p className="text-muted-foreground">
                        Last Response: {employee.last_response_date
                          ? format(new Date(employee.last_response_date), "MMM d, yyyy")
                          : "Never"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Desktop table view
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserMinus className="h-5 w-5 text-destructive" />
          Silent Employees
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveTable>
          <ResponsiveTable.Header>
            <ResponsiveTable.Row>
              <ResponsiveTable.Head>Employee</ResponsiveTable.Head>
              <ResponsiveTable.Head>Department</ResponsiveTable.Head>
              <ResponsiveTable.Head>Status</ResponsiveTable.Head>
              <ResponsiveTable.Head className="text-right">Assignments</ResponsiveTable.Head>
              <ResponsiveTable.Head className="text-right">Last Response</ResponsiveTable.Head>
            </ResponsiveTable.Row>
          </ResponsiveTable.Header>
          <ResponsiveTable.Body>
            {silentEmployees?.map((employee) => (
              <ResponsiveTable.Row key={employee.id}>
                <ResponsiveTable.Cell>
                  <div>
                    <div className="font-medium">
                      {employee.first_name} {employee.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {employee.designation || "No designation"}
                    </div>
                  </div>
                </ResponsiveTable.Cell>
                <ResponsiveTable.Cell>
                  <div>
                    <div className="font-medium">{employee.sbu_name || "Unassigned"}</div>
                    <div className="text-sm text-muted-foreground">
                      {employee.location || "No location"}
                    </div>
                  </div>
                </ResponsiveTable.Cell>
                <ResponsiveTable.Cell>
                  <div className="flex items-center gap-1 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {employee.participation_status}
                  </div>
                </ResponsiveTable.Cell>
                <ResponsiveTable.Cell className="text-right">{employee.total_assignments}</ResponsiveTable.Cell>
                <ResponsiveTable.Cell className="text-right">
                  {employee.last_response_date
                    ? format(new Date(employee.last_response_date), "MMM d, yyyy")
                    : "Never"}
                </ResponsiveTable.Cell>
              </ResponsiveTable.Row>
            ))}
          </ResponsiveTable.Body>
        </ResponsiveTable>
      </CardContent>
    </Card>
  );
}
