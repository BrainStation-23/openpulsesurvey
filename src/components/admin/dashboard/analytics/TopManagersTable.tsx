import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Award, Trophy, Medal } from "lucide-react";

type TopManager = {
  manager_id: string;
  manager_name: string;
  total_respondents: number;
  total_ratings: number;
  average_score: number;
  rank: number;
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Medal className="h-5 w-5 text-amber-600" />;
    default:
      return <Award className="h-5 w-5 text-blue-500" />;
  }
};

export function TopManagersTable() {
  const { data: topManagers, isLoading } = useQuery({
    queryKey: ["top-managers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("top_performing_managers")
        .select("*");

      if (error) throw error;
      return data as TopManager[];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Managers</CardTitle>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Performing Managers
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
            {topManagers?.map((manager) => (
              <TableRow key={manager.manager_id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getRankIcon(manager.rank)}
                    #{manager.rank}
                  </div>
                </TableCell>
                <TableCell>{manager.manager_name}</TableCell>
                <TableCell className="text-right">{manager.total_respondents}</TableCell>
                <TableCell className="text-right">{manager.total_ratings}</TableCell>
                <TableCell className="text-right font-medium">
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