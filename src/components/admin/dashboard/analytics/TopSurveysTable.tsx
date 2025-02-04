import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpRight } from "lucide-react";

type TopSurvey = {
  survey_name: string;
  completion_rate: number;
  total_responses: number;
  campaign_name: string;
};

export function TopSurveysTable() {
  const { data: topSurveys, isLoading } = useQuery({
    queryKey: ["top-surveys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_campaigns")
        .select(`
          name as campaign_name,
          completion_rate,
          surveys!inner (
            name as survey_name
          ),
          survey_assignments (
            survey_responses (
              count
            )
          )
        `)
        .order("completion_rate", { ascending: false })
        .limit(5);

      if (error) throw error;

      return data.map((item) => ({
        survey_name: item.surveys.survey_name,
        campaign_name: item.campaign_name,
        completion_rate: item.completion_rate || 0,
        total_responses: item.survey_assignments.reduce(
          (acc: number, curr: any) => acc + (curr.survey_responses?.length || 0),
          0
        ),
      })) as TopSurvey[];
    },
  });

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
              <TableHead className="text-right">Responses</TableHead>
              <TableHead className="text-right">Completion Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topSurveys?.map((survey) => (
              <TableRow key={survey.survey_name}>
                <TableCell className="font-medium">{survey.survey_name}</TableCell>
                <TableCell>{survey.campaign_name}</TableCell>
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