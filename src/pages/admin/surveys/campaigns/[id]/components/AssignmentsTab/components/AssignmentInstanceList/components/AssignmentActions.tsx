
import { SurveyAssignment } from "@/pages/admin/surveys/types/assignments";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
  Tooltip,
} from "@/components/ui/tooltip";
import { Copy, MoreHorizontal, Send, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AssignmentActionsProps {
  assignment: SurveyAssignment;
  campaignId: string;
  selectedInstanceId?: string;
  canSendReminder: (lastReminderSent: string | null) => boolean;
  getNextReminderTime: (lastReminderSent: string) => string;
}

// Define the type for the delete assignment response
interface DeleteAssignmentResponse {
  success: boolean;
  message: string;
  deleted_responses: number;
}

export function AssignmentActions({
  assignment,
  campaignId,
  selectedInstanceId,
  canSendReminder,
  getNextReminderTime,
}: AssignmentActionsProps) {
  const queryClient = useQueryClient();
  const canSend = canSendReminder(assignment.last_reminder_sent);

  const copyPublicLinkMutation = useMutation({
    mutationFn: async (assignment: SurveyAssignment) => {
      const publicLink = `${window.location.origin}/public/survey/${assignment.public_access_token}`;
      await navigator.clipboard.writeText(publicLink);
    },
    onSuccess: () => {
      toast.success("Survey link copied to clipboard");
    },
    onError: () => {
      toast.error("Failed to copy survey link");
    },
  });

  const sendReminderMutation = useMutation({
    mutationFn: async () => {
      console.log("Sending reminder for assignment:", {
        assignmentIds: [assignment.id],
        campaignId,
        instanceId: selectedInstanceId,
      });

      const { error } = await supabase.functions.invoke("send-campaign-instance-reminder", {
        body: {
          assignmentIds: [assignment.id],
          campaignId,
          instanceId: selectedInstanceId,
          baseUrl: window.location.origin,
        },
      });

      if (error) {
        console.error("Error sending reminder:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Reminder sent successfully");
      queryClient.invalidateQueries({ queryKey: ["campaign-assignments"] });
    },
    onError: (error) => {
      console.error("Error sending reminder:", error);
      toast.error("Failed to send reminder");
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc<DeleteAssignmentResponse>('delete_survey_assignment', {
        p_assignment_id: assignment.id
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["campaign-assignments"] });
      }
    },
    onError: (error) => {
      console.error("Error deleting assignment:", error);
      toast.error("Failed to delete assignment");
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => copyPublicLinkMutation.mutate(assignment)}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Survey Link
        </DropdownMenuItem>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DropdownMenuItem
                  onClick={() => sendReminderMutation.mutate()}
                  disabled={!canSend || assignment.status === "submitted"}
                  className="relative"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Reminder
                </DropdownMenuItem>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {assignment.status === "submitted"
                ? "Cannot send reminder for submitted surveys"
                : !canSend
                ? `Next reminder can be sent after ${getNextReminderTime(assignment.last_reminder_sent)}`
                : "Send a reminder email"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuItem 
          onClick={() => deleteAssignmentMutation.mutate()}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Assignment
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
