
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
import { Copy, MoreHorizontal, Send } from "lucide-react";
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
          assignmentIds: [assignment.id], // Now correctly wrapped in array
          campaignId,
          instanceId: selectedInstanceId,
          baseUrl: window.location.origin, // Changed from frontendUrl to baseUrl
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
