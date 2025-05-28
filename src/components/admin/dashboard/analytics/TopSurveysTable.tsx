
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
      // Get completed campaign instances with their campaigns and surveys
      const { data: instances, error: instancesError } = await supabase
        .from("campaign_instances")
        .select(`
          id,
          starts_at,
          ends_at,
          campaign_id,
          survey_campaigns!inner(
            name,
            survey_id,
            surveys!inner(
              name
            )
          )
        `)
        .eq("status", "completed")
        .order("starts_at", { ascending: false })
        .limit(10);

      if (instancesError) throw instancesError;

      const surveysWithMetrics: TopSurvey[] = [];

      for (const instance of instances || []) {
        // Get total assignments for this campaign
        const { data: assignments, error: assignmentsError } = await supabase
          .from("survey_assignments")
          .select("id", { count: 'exact' })
          .eq("campaign_id", instance.campaign_id);

        if (assignmentsError) continue;

        // Get completed responses for this instance
        const { data: responses, error: responsesError } = await supabase
          .from("survey_responses")
          .select("id", { count: 'exact' })
          .eq("campaign_instance_id", instance.id)
          .eq("status", "submitted");

        if (responsesError) continue;

        const totalAssignments = assignments?.length || 0;
        const completedResponses = responses?.length || 0;
        const completionRate = totalAssignments > 0 ? Math.round((completedResponses / totalAssignments) * 100) : 0;

        surveysWithMetrics.push({
          survey_name: instance.survey_campaigns.surveys.name || "Untitled Survey",
          campaign_name: instance.survey_campaigns.name,
          completion_rate: completionRate,
          total_responses: completedResponses,
          starts_at: instance.starts_at,
          ends_at: instance.ends_at,
        });
      }

      // Sort by completion rate descending
      return surveysWithMetrics.sort((a, b) => b.completion_rate - a.completion_rate);
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
            {topSurveys?.map((survey, index) => (
              <TableRow key={`${survey.campaign_name}-${survey.starts_at}-${index}`}>
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
