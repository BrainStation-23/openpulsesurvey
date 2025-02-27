
import { format } from "date-fns";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Grid, Pencil, Trash2 } from "lucide-react";
import { LiveSession } from "../types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface SessionsTableProps {
  sessions: LiveSession[] | null;
  isLoading: boolean;
  onEdit: (session: LiveSession) => void;
  onStatusChange: () => void;
}

export function SessionsTable({ sessions, isLoading, onEdit, onStatusChange }: SessionsTableProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deleteSession, setDeleteSession] = useState<LiveSession | null>(null);

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

  const handleDelete = async (session: LiveSession) => {
    try {
      const { error } = await supabase
        .from('live_survey_sessions')
        .delete()
        .eq('id', session.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session deleted successfully"
      });

      onStatusChange(); // Refresh the list
      setDeleteSession(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  return (
    <>
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="default"
                            size="icon"
                            onClick={() => navigate(`/admin/surveys/live/${session.id}`)}
                            aria-label="Manage Session"
                          >
                            <Grid className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Manage Live Session</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onEdit(session)}
                            aria-label="Edit Session"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Session Details</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteSession(session)}
                            aria-label="Delete Session"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Session</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </ResponsiveTable.Cell>
              </ResponsiveTable.Row>
            ))
          )}
        </ResponsiveTable.Body>
      </ResponsiveTable>

      <AlertDialog open={!!deleteSession} onOpenChange={() => setDeleteSession(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the session and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSession && handleDelete(deleteSession)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
