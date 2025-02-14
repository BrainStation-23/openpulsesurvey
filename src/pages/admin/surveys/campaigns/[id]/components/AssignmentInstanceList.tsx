import { useState } from "react";
import { SurveyAssignment, ResponseStatus } from "@/pages/admin/surveys/types/assignments";
import { AssignCampaignUsers } from "./AssignCampaignUsers";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Send, MoreHorizontal, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AssignmentInstanceListProps {
  assignments: SurveyAssignment[];
  isLoading: boolean;
  campaignId: string;
  surveyId?: string;
  selectedInstanceId?: string;
}

const statusStyles = {
  submitted: "bg-green-100 text-green-800 border border-green-200",
  expired: "bg-red-100 text-red-800 border border-red-200",
  in_progress: "bg-blue-100 text-blue-800 border border-blue-200",
  assigned: "bg-gray-100 text-gray-800 border border-gray-200"
};

export function AssignmentInstanceList({
  assignments: initialAssignments,
  isLoading: isLoadingProp,
  campaignId,
  surveyId,
  selectedInstanceId,
}: AssignmentInstanceListProps) {
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  // Fetch assignments using the new database function
  const { data: assignments, isLoading } = useQuery({
    queryKey: ["campaign-assignments", campaignId, selectedInstanceId],
    queryFn: async () => {
      console.log("Fetching assignments with params:", { campaignId, selectedInstanceId });
      const { data, error } = await supabase
        .rpc('get_campaign_assignments', {
          p_campaign_id: campaignId,
          p_instance_id: selectedInstanceId
        });

      if (error) {
        console.error("Error fetching assignments:", error);
        throw error;
      }

      console.log("Fetched assignments:", data);

      return data.map((assignment: any) => ({
        ...assignment,
        status: assignment.status as ResponseStatus,
        user: assignment.user_details
      }));
    },
    enabled: !!campaignId,
  });

  const filteredAssignments = (assignments || []).filter(assignment => 
    statusFilter === "all" ? true : assignment.status === statusFilter
  );

  const copyPublicLinkMutation = useMutation({
    mutationFn: async (assignment: SurveyAssignment) => {
      const publicLink = `${window.location.origin}/surveys/${assignment.public_access_token}`;
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
    mutationFn: async (assignmentIds: string[]) => {
      const { error } = await supabase.functions.invoke("send-campaign-instance-reminder", {
        body: { 
          assignmentIds, 
          instanceId: selectedInstanceId,
          campaignId 
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

  const columns = [
    {
      id: "select",
      header: ({ table }: any) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2 px-2 py-1 bg-gray-50 rounded-md border">
                <Checkbox
                  checked={table.getIsAllPageRowsSelected()}
                  onCheckedChange={(value) => {
                    table.toggleAllPageRowsSelected(!!value);
                    setSelectedAssignments(
                      value
                        ? filteredAssignments.map((assignment) => assignment.id)
                        : []
                    );
                  }}
                />
                <span className="text-sm text-gray-700">Select All</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Select all assignments on this page</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      cell: ({ row }: any) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            setSelectedAssignments((prev) =>
              value
                ? [...prev, row.original.id]
                : prev.filter((id) => id !== row.original.id)
            );
          }}
        />
      ),
    },
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }: any) => {
        const assignment = row.original;
        const user = assignment.user;
        return (
          <div className="flex items-center gap-2">
            <div>
              <div className="font-medium flex items-center gap-2">
                {user.first_name} {user.last_name}
                <Badge className={cn("text-xs", statusStyles[assignment.status])}>
                  {assignment.status.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {user.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "sbu",
      header: "SBU",
      cell: ({ row }: any) => {
        const user = row.original.user;
        const primarySbu = user.user_sbus?.find(
          (sbu: any) => sbu.is_primary
        )?.sbu.name;
        return primarySbu || "N/A";
      },
    },
    {
      accessorKey: "last_reminder",
      header: "Last Reminder",
      cell: ({ row }: any) => {
        const lastReminder = row.original.last_reminder_sent
          ? new Date(row.original.last_reminder_sent).toLocaleDateString()
          : "Never";
        return lastReminder;
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const assignment = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => copyPublicLinkMutation.mutate(assignment)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Survey Link
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => sendReminderMutation.mutate([assignment.id])}
                disabled={assignment.status === 'submitted'}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Reminder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {selectedAssignments.length > 0 && (
            <Button
              size="sm"
              onClick={() => sendReminderMutation.mutate(selectedAssignments)}
              disabled={sendReminderMutation.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              Send Reminder ({selectedAssignments.length})
            </Button>
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
        {surveyId && (
          <AssignCampaignUsers surveyId={surveyId} campaignId={campaignId} />
        )}
      </div>

      <DataTable
        columns={columns}
        data={filteredAssignments}
        isLoading={isLoading}
      />
    </div>
  );
}
