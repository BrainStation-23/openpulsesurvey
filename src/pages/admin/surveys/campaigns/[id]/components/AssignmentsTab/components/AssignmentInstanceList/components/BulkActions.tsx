
import { Button } from "@/components/ui/button";
import { Mail, Send } from "lucide-react";
import {
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
  Tooltip,
} from "@/components/ui/tooltip";

interface BulkActionsProps {
  selectedAssignments: string[];
  eligibleAssignmentsCount: number;
  sendReminderMutation: {
    mutate: (params: any) => void;
    isPending: boolean;
  };
  sendAssignmentNotificationMutation: {
    mutate: (params: any) => void;
    isPending: boolean;
  };
  campaignId: string;
  selectedInstanceId?: string;
}

export function BulkActions({
  selectedAssignments,
  eligibleAssignmentsCount,
  sendReminderMutation,
  sendAssignmentNotificationMutation,
  campaignId,
  selectedInstanceId,
}: BulkActionsProps) {
  if (selectedAssignments.length === 0) return null;
  
  return (
    <div className="flex gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                size="sm"
                onClick={() =>
                  sendReminderMutation.mutate({
                    campaignId,
                    instanceId: selectedInstanceId,
                    assignmentIds: selectedAssignments,
                  })
                }
                disabled={sendReminderMutation.isPending || eligibleAssignmentsCount === 0}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Reminder ({eligibleAssignmentsCount}/{selectedAssignments.length})
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {eligibleAssignmentsCount === 0
              ? "No selected assignments are eligible for reminders at this time"
              : `${eligibleAssignmentsCount} out of ${selectedAssignments.length} selected assignments can receive reminders`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Button
        size="sm"
        onClick={() =>
          sendAssignmentNotificationMutation.mutate({
            campaignId,
            instanceId: selectedInstanceId,
            assignmentIds: selectedAssignments,
          })
        }
        disabled={sendAssignmentNotificationMutation.isPending || selectedAssignments.length === 0}
      >
        <Mail className="mr-2 h-4 w-4" />
        Send Assignment Notification ({selectedAssignments.length})
      </Button>
    </div>
  );
}
