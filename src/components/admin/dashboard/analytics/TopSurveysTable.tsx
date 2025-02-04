import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight } from "lucide-react";
import { format } from "date-fns";


type TopSurvey = {
  survey_name: string;
  completion_rate: number;
  total_responses: number;
  campaign_name: string;
  starts_at: string;
  ends_at: string;

};

export function TopSurveysTable() {
  const { data: topSurveys, isLoading } = useQuery({
    queryKey: ["top-surveys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("top_performing_surveys")
        .select("*");


      if (error) throw error;

      return data.map((item) => ({
        survey_name: item.survey_name || "Untitled Survey",
        campaign_name: item.campaign_name,
        completion_rate: item.completion_rate || 0,
        total_responses: item.total_responses || 0,
        starts_at: item.starts_at,
        ends_at: item.ends_at,
      })) as TopSurvey[];
    },
  });

  const formatDateRange = (starts_at: string, ends_at: string) => {
    return `${format(new Date(starts_at), "MMM d")} - ${format(new Date(ends_at), "MMM d")}`;
  };


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Surveys</CardTitle>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Surveys</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Survey</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead className="text-right">Period</TableHead>

              <TableHead className="text-right">Responses</TableHead>
              <TableHead className="text-right">Completion Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topSurveys?.map((survey) => (
              <TableRow key={`${survey.campaign_name}-${survey.starts_at}`}>
                <TableCell className="font-medium">{survey.survey_name}</TableCell>
                <TableCell>{survey.campaign_name}</TableCell>
                <TableCell className="text-right">
                  {formatDateRange(survey.starts_at, survey.ends_at)}
                </TableCell>

                <TableCell className="text-right">{survey.total_responses}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {survey.completion_rate}%
                    {survey.completion_rate > 75 && (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}