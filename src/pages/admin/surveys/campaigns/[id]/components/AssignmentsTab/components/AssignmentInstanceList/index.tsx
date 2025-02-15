
import { useState } from "react";
import { ResponseStatus, SurveyAssignment } from "@/pages/admin/surveys/types/assignments";
import { AssignCampaignUsers } from "../../AssignCampaignUsers";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
  Tooltip,
} from "@/components/ui/tooltip";
import { TableHeader } from "./components/TableHeader";
import { AssignmentActions } from "./components/AssignmentActions";
import { UserCell } from "./components/UserCell";
import { toast } from "sonner";

interface AssignmentInstanceListProps {
  campaignId: string;
  surveyId?: string;
  selectedInstanceId?: string;
}

export function AssignmentInstanceList({
  campaignId,
  surveyId,
  selectedInstanceId,
}: AssignmentInstanceListProps) {
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const REMINDER_COOLDOWN_HOURS = 24;

  const canSendReminder = (lastReminderSent: string | null) => {
    if (!lastReminderSent) return true;
    const lastSent = new Date(lastReminderSent);
    const now = new Date();
    const hoursSinceLastReminder = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastReminder >= REMINDER_COOLDOWN_HOURS;
  };

  const getNextReminderTime = (lastReminderSent: string) => {
    const lastSent = new Date(lastReminderSent);
    const nextAvailable = new Date(lastSent.getTime() + REMINDER_COOLDOWN_HOURS * 60 * 60 * 1000);
    return nextAvailable.toLocaleString();
  };

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["campaign-assignments", campaignId, selectedInstanceId],
    queryFn: async () => {
      console.log("Fetching assignments with params:", { campaignId, selectedInstanceId });
      const { data, error } = await supabase.rpc("get_campaign_assignments", {
        p_campaign_id: campaignId,
        p_instance_id: selectedInstanceId || null,
      });

      if (error) {
        console.error("Error fetching assignments:", error);
        throw error;
      }

      console.log("Fetched assignments:", data);

      return data.map((assignment: any) => ({
        ...assignment,
        status: assignment.status as ResponseStatus,
        user: assignment.user_details,
      }));
    },
    enabled: !!campaignId,
  });

  const sendReminderMutation = useMutation({
    mutationFn: async ({ instanceId, campaignId }: { instanceId?: string; campaignId: string }) => {
      const { error } = await supabase.functions.invoke("send-survey-reminder", {
        body: {
          instanceId,
          campaignId,
          frontendUrl: window.location.origin,
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reminders sent successfully");
      queryClient.invalidateQueries({ queryKey: ["campaign-assignments"] });
      setSelectedAssignments([]);
    },
    onError: (error) => {
      console.error("Error sending reminders:", error);
      toast.error("Failed to send reminders");
    },
  });

  const filteredAssignments = (assignments || []).filter((assignment) =>
    statusFilter === "all" ? true : assignment.status === statusFilter
  );

  const eligibleAssignmentsCount = selectedAssignments.filter((id) => {
    const assignment = assignments?.find((a) => a.id === id);
    return assignment && canSendReminder(assignment.last_reminder_sent);
  }).length;

  const columns = [
    {
      id: "select",
      header: ({ table }: any) => (
        <TableHeader
          table={table}
          onSelectAll={(value) =>
            setSelectedAssignments(value ? filteredAssignments.map((a) => a.id) : [])
          }
        />
      ),
      cell: ({ row }: any) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            setSelectedAssignments((prev) =>
              value ? [...prev, row.original.id] : prev.filter((id) => id !== row.original.id)
            );
          }}
        />
      ),
    },
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }: any) => <UserCell assignment={row.original} />,
    },
    {
      accessorKey: "sbu",
      header: "SBU",
      cell: ({ row }: any) => {
        const user = row.original.user;
        const primarySbu = user.user_sbus?.find((sbu: any) => sbu.is_primary)?.sbu.name;
        return primarySbu || "N/A";
      },
    },
    {
      accessorKey: "last_reminder",
      header: "Last Reminder",
      cell: ({ row }: any) => {
        const assignment = row.original;
        const lastReminderSent = assignment.last_reminder_sent;

        if (!lastReminderSent) return "Never";

        const canSend = canSendReminder(lastReminderSent);
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="text-left">
                <span className={!canSend ? "text-yellow-600" : undefined}>
                  {new Date(lastReminderSent).toLocaleDateString()}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {canSend
                  ? "Can send reminder now"
                  : `Next reminder can be sent after ${getNextReminderTime(lastReminderSent)}`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <AssignmentActions
          assignment={row.original}
          campaignId={campaignId}
          selectedInstanceId={selectedInstanceId}
          canSendReminder={canSendReminder}
          getNextReminderTime={getNextReminderTime}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {selectedAssignments.length > 0 && (
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
          )}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {surveyId && <AssignCampaignUsers surveyId={surveyId} campaignId={campaignId} />}
      </div>

      <DataTable columns={columns} data={filteredAssignments} isLoading={isLoading} />
    </div>
  );
}
