
import { format } from "date-fns";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Play, Pause, Ban } from "lucide-react";
import { LiveSession } from "../types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SessionsTableProps {
  sessions: LiveSession[] | null;
  isLoading: boolean;
  onEdit: (session: LiveSession) => void;
  onStatusChange: () => void;
}

export function SessionsTable({ sessions, isLoading, onEdit, onStatusChange }: SessionsTableProps) {
  const { toast } = useToast();

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

  const handleStatusChange = async (sessionId: string, newStatus: LiveSession["status"]) => {
    try {
      const { error } = await supabase
        .from('live_survey_sessions')
        .update({ status: newStatus })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Session status updated to ${newStatus}`
      });

      onStatusChange();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  return (
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
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEdit(session)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {session.status !== 'ended' && (
                    <>
                      {session.status !== 'active' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStatusChange(session.id, 'active')}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {session.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStatusChange(session.id, 'paused')}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStatusChange(session.id, 'ended')}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </ResponsiveTable.Cell>
            </ResponsiveTable.Row>
          ))
        )}
      </ResponsiveTable.Body>
    </ResponsiveTable>
  );
}
