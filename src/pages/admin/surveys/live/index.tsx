
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users, Timer } from "lucide-react";
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveTable } from "@/components/ui/responsive-table";

// Define types based on our database schema
type SessionStatus = 'initial' | 'active' | 'paused' | 'ended';

interface LiveSession {
  id: string;
  survey_id: string;
  name: string;
  description: string | null;
  join_code: string;
  status: SessionStatus;
  created_at: string;
  survey: {
    name: string;
  } | null;
  participant_count: number;
}

export default function LiveSurveyPage() {
  const [isCreating, setIsCreating] = useState(false);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['live-sessions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('live_survey_sessions')
        .select(`
          id,
          survey_id,
          name,
          description,
          join_code,
          status,
          created_at,
          survey:surveys(name),
          participant_count:live_session_participants(count)
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process the data to handle nullable fields and counts
      return (data || []).map((session): LiveSession => ({
        ...session,
        survey: session.survey || { name: 'Unknown Survey' },
        participant_count: session.participant_count?.[0]?.count || 0
      }));
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Live Survey</h1>
        <Card>
          <CardContent className="p-6">
            Loading...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Live Survey</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Live Session
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            View and manage your live survey sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveTable className="border rounded-md">
            <ResponsiveTable.Header>
              <ResponsiveTable.Row>
                <ResponsiveTable.Head>Session Name</ResponsiveTable.Head>
                <ResponsiveTable.Head>Survey</ResponsiveTable.Head>
                <ResponsiveTable.Head>Join Code</ResponsiveTable.Head>
                <ResponsiveTable.Head>Status</ResponsiveTable.Head>
                <ResponsiveTable.Head>Participants</ResponsiveTable.Head>
                <ResponsiveTable.Head>Created</ResponsiveTable.Head>
                <ResponsiveTable.Head>Actions</ResponsiveTable.Head>
              </ResponsiveTable.Row>
            </ResponsiveTable.Header>
            <ResponsiveTable.Body>
              {sessions?.map((session) => (
                <ResponsiveTable.Row key={session.id}>
                  <ResponsiveTable.Cell>{session.name}</ResponsiveTable.Cell>
                  <ResponsiveTable.Cell>{session.survey?.name}</ResponsiveTable.Cell>
                  <ResponsiveTable.Cell>
                    <code className="bg-muted px-2 py-1 rounded">
                      {session.join_code}
                    </code>
                  </ResponsiveTable.Cell>
                  <ResponsiveTable.Cell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      session.status === 'active' ? 'bg-green-100 text-green-800' :
                      session.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      session.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {session.status}
                    </span>
                  </ResponsiveTable.Cell>
                  <ResponsiveTable.Cell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {session.participant_count}
                    </div>
                  </ResponsiveTable.Cell>
                  <ResponsiveTable.Cell>
                    <div className="flex items-center gap-1">
                      <Timer className="h-4 w-4" />
                      {format(new Date(session.created_at), 'MMM d, yyyy HH:mm')}
                    </div>
                  </ResponsiveTable.Cell>
                  <ResponsiveTable.Cell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {/* TODO: Implement session control */}}
                    >
                      Manage
                    </Button>
                  </ResponsiveTable.Cell>
                </ResponsiveTable.Row>
              ))}
              {!sessions?.length && (
                <ResponsiveTable.Row>
                  <ResponsiveTable.Cell colSpan={7} className="text-center text-muted-foreground">
                    No live sessions found. Create one to get started.
                  </ResponsiveTable.Cell>
                </ResponsiveTable.Row>
              )}
            </ResponsiveTable.Body>
          </ResponsiveTable>
        </CardContent>
      </Card>
    </div>
  );
}
