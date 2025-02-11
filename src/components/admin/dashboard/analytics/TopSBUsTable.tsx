
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Award, Trophy, Medal, Building2 } from "lucide-react";

type TopSBU = {
  sbu_id: string;
  sbu_name: string;
  total_respondents: number;
  total_ratings: number;
  average_score: number | null;
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

export function TopSBUsTable() {
  const { data: topSBUs, isLoading } = useQuery({
    queryKey: ["top-sbus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("top_performing_sbus")
        .select("*");

      if (error) throw error;
      return data as TopSBU[];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing SBUs</CardTitle>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-yellow-500" />
          Top Performing SBUs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>SBU</TableHead>
              <TableHead className="text-right">Respondents</TableHead>
              <TableHead className="text-right">Total Ratings</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topSBUs?.map((sbu) => (
              <TableRow key={sbu.sbu_id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getRankIcon(sbu.rank)}
                    #{sbu.rank}
                  </div>
                </TableCell>
                <TableCell>{sbu.sbu_name}</TableCell>
                <TableCell className="text-right">{sbu.total_respondents}</TableCell>
                <TableCell className="text-right">{sbu.total_ratings}</TableCell>
                <TableCell className="text-right font-medium">
                  {sbu.average_score !== null ? `${sbu.average_score.toFixed(1)}%` : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
