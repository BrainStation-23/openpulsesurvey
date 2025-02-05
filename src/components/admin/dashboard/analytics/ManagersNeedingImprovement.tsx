import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, UserMinus } from "lucide-react";

type ManagerNeedingImprovement = {
  manager_id: string;
  manager_name: string;
  total_respondents: number;
  total_ratings: number;
  average_score: number;
  improvement_rank: number;
};

export function ManagersNeedingImprovement() {
  const { data: managers, isLoading } = useQuery({
    queryKey: ["managers-needing-improvement"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("managers_needing_improvement")
        .select("*");

      if (error) throw error;

      return data as ManagerNeedingImprovement[];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Managers Needing Improvement</CardTitle>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          Managers Needing Improvement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead className="text-right">Respondents</TableHead>
              <TableHead className="text-right">Total Ratings</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {managers?.map((manager) => (
              <TableRow key={manager.manager_id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <UserMinus className="h-4 w-4 text-destructive" />
                    #{manager.improvement_rank}
                  </div>
                </TableCell>
                <TableCell>{manager.manager_name}</TableCell>
                <TableCell className="text-right">{manager.total_respondents}</TableCell>
                <TableCell className="text-right">{manager.total_ratings}</TableCell>
                <TableCell className="text-right font-medium text-destructive">
                  {manager.average_score.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}