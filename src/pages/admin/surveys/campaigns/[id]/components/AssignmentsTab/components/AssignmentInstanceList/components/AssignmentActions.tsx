
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
import { Copy, MoreHorizontal, Send, Trash2, Mail } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { NotificationDialog } from "./NotificationDialog";

interface AssignmentActionsProps {
  assignment: SurveyAssignment;
  campaignId: string;
  selectedInstanceId?: string;
  canSendReminder: (lastReminderSent: string | null) => boolean;
  getNextReminderTime: (lastReminderSent: string) => string;
  isAnonymous?: boolean;
}

interface DeleteAssignmentResponse {
  success: boolean;
  message: string;
  deleted_responses: number;
}

function isDeleteAssignmentResponse(data: unknown): data is DeleteAssignmentResponse {
  const response = data as DeleteAssignmentResponse;
  return (
    typeof response === 'object' &&
    response !== null &&
    typeof response.success === 'boolean' &&
    typeof response.message === 'string' &&
    typeof response.deleted_responses === 'number'
  );
}

export function AssignmentActions({
  assignment,
  campaignId,
  selectedInstanceId,
  canSendReminder,
  getNextReminderTime,
  isAnonymous = false,
}: AssignmentActionsProps) {
  const queryClient = useQueryClient();
  const canSend = canSendReminder(assignment.last_reminder_sent);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);

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
          frontendUrl: window.location.origin,
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

  const sendAssignmentNotificationMutation = useMutation({
    mutationFn: async (customMessage?: string) => {
      console.log("Sending assignment notification for assignment:", {
        assignmentIds: [assignment.id],
        campaignId,
        instanceId: selectedInstanceId, 
        hasCustomMessage: !!customMessage,
      });

      const { error } = await supabase.functions.invoke("send-campaign-assignment-notification", {
        body: {
          assignmentIds: [assignment.id],
          campaignId,
          instanceId: selectedInstanceId,
          frontendUrl: window.location.origin,
          customMessage,
        },
      });

      if (error) {
        console.error("Error sending assignment notification:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Assignment notification sent successfully");
      queryClient.invalidateQueries({ queryKey: ["campaign-assignments"] });
    },
    onError: (error) => {
      console.error("Error sending assignment notification:", error);
      toast.error("Failed to send assignment notification");
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('delete_survey_assignment', { 
        p_assignment_id: assignment.id 
      });

      if (error) throw error;
      if (!data) throw new Error('No data returned from delete operation');
      
      if (!isDeleteAssignmentResponse(data)) {
        throw new Error('Invalid response format from delete operation');
      }
      
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["campaign-assignments"] });
    },
    onError: (error) => {
      console.error("Error deleting assignment:", error);
      toast.error("Failed to delete assignment");
    },
  });

  const handleSendNotification = (customMessage: string) => {
    sendAssignmentNotificationMutation.mutate(customMessage.trim() || undefined);
    setIsNotificationDialogOpen(false);
  };

  return (
    <>
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
          <DropdownMenuItem
            onClick={() => setIsNotificationDialogOpen(true)}
            disabled={assignment.status === "submitted"}
          >
            <Mail className="mr-2 h-4 w-4" />
            Send Assignment Notification
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

      <NotificationDialog
        isOpen={isNotificationDialogOpen}
        selectedCount={1}
        onClose={() => setIsNotificationDialogOpen(false)}
        onSend={handleSendNotification}
        isSending={sendAssignmentNotificationMutation.isPending}
        isAnonymous={isAnonymous}
      />
    </>
  );
}
