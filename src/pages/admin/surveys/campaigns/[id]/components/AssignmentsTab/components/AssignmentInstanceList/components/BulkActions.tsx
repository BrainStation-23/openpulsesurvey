
import { Button } from "@/components/ui/button";
import { Mail, Send } from "lucide-react";
import {
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
  Tooltip,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { NotificationDialog } from "./NotificationDialog";

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
  isAnonymous?: boolean;
}

export function BulkActions({
  selectedAssignments,
  eligibleAssignmentsCount,
  sendReminderMutation,
  sendAssignmentNotificationMutation,
  campaignId,
  selectedInstanceId,
  isAnonymous = false,
}: BulkActionsProps) {
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  
  if (selectedAssignments.length === 0) return null;
  
  const handleSendNotification = (customMessage: string) => {
    if (!selectedInstanceId) {
      console.error("No instance selected");
      return;
    }
    
    // Make sure we're passing both campaignId and instanceId
    sendAssignmentNotificationMutation.mutate({
      campaignId,
      instanceId: selectedInstanceId,
      assignmentIds: selectedAssignments,
      customMessage: customMessage.trim() || undefined,
    });
    setIsNotificationDialogOpen(false);
  };
  
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
                disabled={sendReminderMutation.isPending || eligibleAssignmentsCount === 0 || !selectedInstanceId}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Reminder ({eligibleAssignmentsCount}/{selectedAssignments.length})
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {!selectedInstanceId 
              ? "Please select an instance first"
              : eligibleAssignmentsCount === 0
              ? "No selected assignments are eligible for reminders at this time"
              : `${eligibleAssignmentsCount} out of ${selectedAssignments.length} selected assignments can receive reminders`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Button
        size="sm"
        onClick={() => setIsNotificationDialogOpen(true)}
        disabled={sendAssignmentNotificationMutation.isPending || selectedAssignments.length === 0 || !selectedInstanceId}
      >
        <Mail className="mr-2 h-4 w-4" />
        Send Assignment Notification ({selectedAssignments.length})
      </Button>
      
      <NotificationDialog
        isOpen={isNotificationDialogOpen}
        selectedCount={selectedAssignments.length}
        onClose={() => setIsNotificationDialogOpen(false)}
        onSend={handleSendNotification}
        isSending={sendAssignmentNotificationMutation.isPending}
        isAnonymous={isAnonymous}
      />
    </div>
  );
}
