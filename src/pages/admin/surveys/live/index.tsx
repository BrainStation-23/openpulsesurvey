
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type LiveSession = {
  id: string;
  name: string;
  join_code: string;
  status: "initial" | "active" | "paused" | "ended";
  created_at: string;
};

export default function LiveSurveyPage() {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["live-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_survey_sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LiveSession[];
    },
  });

  const getStatusBadgeVariant = (status: LiveSession["status"]) => {
    switch (status) {
      case "active":
        return "success";
      case "ended":
        return "secondary";
      case "paused":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Live Survey</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveTable>
            <ResponsiveTable.Header>
              <ResponsiveTable.Row>
                <ResponsiveTable.Head>Session Name</ResponsiveTable.Head>
                <ResponsiveTable.Head>Join Code</ResponsiveTable.Head>
                <ResponsiveTable.Head>Status</ResponsiveTable.Head>
                <ResponsiveTable.Head>Created</ResponsiveTable.Head>
                <ResponsiveTable.Head className="text-right">Actions</ResponsiveTable.Head>
              </ResponsiveTable.Row>
            </ResponsiveTable.Header>
            <ResponsiveTable.Body>
              {isLoading ? (
                <ResponsiveTable.Row>
                  <ResponsiveTable.Cell colSpan={5} className="text-center">
                    Loading sessions...
                  </ResponsiveTable.Cell>
                </ResponsiveTable.Row>
              ) : !sessions?.length ? (
                <ResponsiveTable.Row>
                  <ResponsiveTable.Cell colSpan={5} className="text-center">
                    No sessions found.
                  </ResponsiveTable.Cell>
                </ResponsiveTable.Row>
              ) : (
                sessions.map((session) => (
                  <ResponsiveTable.Row key={session.id}>
                    <ResponsiveTable.Cell>{session.name}</ResponsiveTable.Cell>
                    <ResponsiveTable.Cell>
                      <code className="rounded bg-muted px-2 py-1">
                        {session.join_code}
                      </code>
                    </ResponsiveTable.Cell>
                    <ResponsiveTable.Cell>
                      <Badge variant={getStatusBadgeVariant(session.status)}>
                        {session.status}
                      </Badge>
                    </ResponsiveTable.Cell>
                    <ResponsiveTable.Cell>
                      {format(new Date(session.created_at), "MMM d, yyyy")}
                    </ResponsiveTable.Cell>
                    <ResponsiveTable.Cell className="text-right">
                      {/* Action buttons will be added here */}
                    </ResponsiveTable.Cell>
                  </ResponsiveTable.Row>
                ))
              )}
            </ResponsiveTable.Body>
          </ResponsiveTable>
        </CardContent>
      </Card>
    </div>
  );
}
