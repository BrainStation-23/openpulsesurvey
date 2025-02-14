
import { useState } from "react";
import { Assignment } from "@/pages/admin/surveys/types/assignments";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Send, MoreHorizontal, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AssignmentInstanceListProps {
  assignments: Assignment[];
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
  assignments,
  isLoading,
  campaignId,
  surveyId,
  selectedInstanceId,
}: AssignmentInstanceListProps) {
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const copyPublicLinkMutation = useMutation({
    mutationFn: async (assignment: Assignment) => {
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
      const { error } = await supabase.functions.invoke("send-survey-reminder", {
        body: { assignmentIds, instanceId: selectedInstanceId },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reminder sent successfully");
      queryClient.invalidateQueries({ queryKey: ["campaign-assignments"] });
      setSelectedAssignments([]);
    },
    onError: () => {
      toast.error("Failed to send reminder");
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
                        ? assignments.map((assignment) => assignment.id)
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
        return (
          <div className="flex items-center gap-2">
            <div>
              <div className="font-medium flex items-center gap-2">
                {assignment.user.first_name} {assignment.user.last_name}
                <Badge className={cn("text-xs", statusStyles[assignment.status])}>
                  {assignment.status.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {assignment.user.email}
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
        const primarySbu = row.original.user.user_sbus?.find(
          (sbu: any) => sbu.is_primary
        )?.sbu.name;
        return primarySbu || "N/A";
      },
    },
    {
      accessorKey: "due_date",
      header: "Due Date",
      cell: ({ row }: any) => {
        const dueDate = row.original.due_date
          ? new Date(row.original.due_date).toLocaleDateString()
          : "N/A";
        return dueDate;
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
        </div>
        {surveyId && (
          <AssignCampaignUsers surveyId={surveyId} campaignId={campaignId} />
        )}
      </div>

      <DataTable
        columns={columns}
        data={assignments}
        isLoading={isLoading}
      />
    </div>
  );
}
