
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Timer } from "lucide-react";
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import CreateSessionDialog from "./components/CreateSessionDialog";

type SessionStatus = 'initial' | 'active' | 'paused' | 'ended';

interface LiveSession {
  id: string;
  name: string;
  description: string | null;
  join_code: string;
  status: SessionStatus;
  created_at: string;
  created_by: string;
}

export default function LiveSurveyPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  const { data: sessions, isLoading, refetch } = useQuery({
    queryKey: ['live-sessions', showOnlyMine],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('live_survey_sessions')
        .select('id, name, description, join_code, status, created_at, created_by')
        .order('created_at', { ascending: false });

      if (showOnlyMine) {
        query = query.eq('created_by', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching live sessions:', error);
        throw error;
      }

      return data || [];
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

      <CreateSessionDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        onSuccess={refetch}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sessions</CardTitle>
              <CardDescription>
                View and manage your live survey sessions
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-mine"
                checked={showOnlyMine}
                onCheckedChange={setShowOnlyMine}
              />
              <Label htmlFor="show-mine">Show only my sessions</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveTable className="border rounded-md">
            <ResponsiveTable.Header>
              <ResponsiveTable.Row>
                <ResponsiveTable.Head>Session Name</ResponsiveTable.Head>
                <ResponsiveTable.Head>Join Code</ResponsiveTable.Head>
                <ResponsiveTable.Head>Status</ResponsiveTable.Head>
                <ResponsiveTable.Head>Created</ResponsiveTable.Head>
                <ResponsiveTable.Head>Actions</ResponsiveTable.Head>
              </ResponsiveTable.Row>
            </ResponsiveTable.Header>
            <ResponsiveTable.Body>
              {sessions?.map((session) => (
                <ResponsiveTable.Row key={session.id}>
                  <ResponsiveTable.Cell>{session.name}</ResponsiveTable.Cell>
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
                  <ResponsiveTable.Cell colSpan={5} className="text-center text-muted-foreground">
                    No sessions found. Create one to get started.
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
