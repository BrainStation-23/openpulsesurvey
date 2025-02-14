
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Copy, Send } from "lucide-react";
import { AssignCampaignUsers } from "./AssignCampaignUsers";
import { Assignment, ResponseStatus } from "@/pages/admin/surveys/types/assignments";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AssignmentInstanceListProps {
  assignments: Assignment[];
  isLoading?: boolean;
  campaignId?: string;
  surveyId?: string;
  selectedInstanceId?: string;
}

export function AssignmentInstanceList({ 
  assignments, 
  isLoading,
  campaignId,
  surveyId,
  selectedInstanceId
}: AssignmentInstanceListProps) {
  const [selectedAssignments, setSelectedAssignments] = useState<Set<string>>(new Set());
  const [sendingReminders, setSendingReminders] = useState<Set<string>>(new Set());
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (isLoading) {
    return <div>Loading assignments...</div>;
  }

  const getStatusColor = (status: ResponseStatus) => {
    switch (status) {
      case "submitted":
        return "bg-green-500";
      case "expired":
        return "bg-red-500";
      case "in_progress":
        return "bg-secondary";
      default:
        return "bg-gray-500";
    }
  };

  const getPrimarySBU = (assignment: Assignment) => {
    return assignment.user.user_sbus?.find(us => us.is_primary)?.sbu.name;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssignments(new Set(assignments.map(a => a.id)));
    } else {
      setSelectedAssignments(new Set());
    }
  };

  const handleSelectAssignment = (assignmentId: string, checked: boolean) => {
    const newSelected = new Set(selectedAssignments);
    if (checked) {
      newSelected.add(assignmentId);
    } else {
      newSelected.delete(assignmentId);
    }
    setSelectedAssignments(newSelected);
  };

  const handleCopyLink = async (assignment: Assignment) => {
    const baseUrl = window.location.origin;
    const publicUrl = `${baseUrl}/public/survey/${assignment.public_access_token}`;
    
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedLink(assignment.id);
      toast({
        title: "Link copied",
        description: "Survey link has been copied to clipboard",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedLink(null);
      }, 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleSendReminder = async (assignment: Assignment) => {
    if (!selectedInstanceId) return;

    try {
      setSendingReminders(prev => new Set(prev).add(assignment.id));

      // Check if reminder was sent in the last 24 hours
      if (assignment.last_reminder_sent) {
        const lastSent = new Date(assignment.last_reminder_sent);
        const hoursSinceLastReminder = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastReminder < 24) {
          toast({
            title: "Reminder limit reached",
            description: "A reminder was already sent in the last 24 hours",
            variant: "destructive",
          });
          return;
        }
      }

      const response = await supabase.functions.invoke('send-survey-reminder', {
        body: {
          assignmentId: assignment.id,
          surveyName: "Your Survey", // This should come from props if needed
          dueDate: assignment.due_date,
          recipientEmail: assignment.user.email,
          recipientName: `${assignment.user.first_name} ${assignment.user.last_name}`,
          publicAccessToken: assignment.public_access_token,
          frontendUrl: window.location.origin,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Reminder sent",
        description: `Reminder email sent to ${assignment.user.email}`,
      });

    } catch (error) {
      toast({
        title: "Failed to send reminder",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setSendingReminders(prev => {
        const newSet = new Set(prev);
        newSet.delete(assignment.id);
        return newSet;
      });
    }
  };

  const handleSendBulkReminders = async () => {
    for (const assignmentId of selectedAssignments) {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (assignment) {
        await handleSendReminder(assignment);
      }
    }
    setSelectedAssignments(new Set());
  };

  const isAllSelected = assignments.length > 0 && selectedAssignments.size === assignments.length;
  const hasSomeSelected = selectedAssignments.size > 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Assignments</h3>
          {hasSomeSelected && (
            <Button
              variant="default"
              size="sm"
              onClick={handleSendBulkReminders}
              disabled={selectedAssignments.size === 0}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send Reminders ({selectedAssignments.size})
            </Button>
          )}
        </div>
        {surveyId && campaignId && (
          <AssignCampaignUsers
            surveyId={surveyId}
            campaignId={campaignId}
          />
        )}
      </div>

      <ScrollArea className="h-[600px] rounded-md border">
        <div className="p-4 space-y-4">
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No assignments found
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center px-4 py-2">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all assignments"
                />
              </div>
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card"
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedAssignments.has(assignment.id)}
                      onCheckedChange={(checked) => 
                        handleSelectAssignment(assignment.id, checked === true)
                      }
                      aria-label={`Select ${assignment.user.first_name}'s assignment`}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {assignment.user.first_name} {assignment.user.last_name}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {assignment.user.email}
                      </div>
                      {getPrimarySBU(assignment) && (
                        <div className="text-sm text-muted-foreground">
                          SBU: {getPrimarySBU(assignment)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(assignment)}
                      className="flex items-center gap-2"
                    >
                      <Copy className={`h-4 w-4 ${copiedLink === assignment.id ? 'text-green-500' : ''}`} />
                      {copiedLink === assignment.id ? 'Copied!' : 'Copy Link'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendReminder(assignment)}
                      disabled={sendingReminders.has(assignment.id)}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {sendingReminders.has(assignment.id) ? 'Sending...' : 'Send Reminder'}
                    </Button>
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
