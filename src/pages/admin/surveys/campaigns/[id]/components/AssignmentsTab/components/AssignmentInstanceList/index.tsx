
import { useState } from "react";
import { ResponseStatus, SurveyAssignment } from "@/pages/admin/surveys/types/assignments";
import { AssignCampaignUsers } from "../AssignCampaignUsers";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Send } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Database } from "@/integrations/supabase/types";

interface AssignmentInstanceListProps {
  campaignId: string;
  surveyId?: string;
  selectedInstanceId?: string;
}

// Define the type for the response from our RPC function
type PaginatedAssignment = Database["public"]["Functions"]["get_paginated_campaign_assignments"]["Returns"][0];

export function AssignmentInstanceList({
  campaignId,
  surveyId,
  selectedInstanceId,
}: AssignmentInstanceListProps) {
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
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

  const { 
    data: assignmentsData, 
    isLoading,
    isFetching 
  } = useQuery({
    queryKey: ["campaign-assignments", campaignId, selectedInstanceId, statusFilter, searchTerm, currentPage, pageSize],
    queryFn: async () => {
      console.log("Fetching assignments with params:", { 
        campaignId, 
        selectedInstanceId, 
        statusFilter, 
        searchTerm, 
        currentPage, 
        pageSize 
      });
      
      const { data, error } = await supabase.rpc<PaginatedAssignment>("get_paginated_campaign_assignments", {
        p_campaign_id: campaignId,
        p_instance_id: selectedInstanceId || null,
        p_status: statusFilter === "all" ? null : statusFilter,
        p_search_term: searchTerm || null,
        p_page: currentPage,
        p_page_size: pageSize
      });

      if (error) {
        console.error("Error fetching assignments:", error);
        throw error;
      }

      console.log("Fetched assignments:", data);

      // The data object includes everything we need (assignments and total count)
      if (data && Array.isArray(data) && data.length > 0) {
        const totalCount = data[0].total_count || 0;
        const assignments = data.map((assignment) => ({
          ...assignment,
          status: assignment.status as ResponseStatus,
          user: assignment.user_details,
        }));

        return {
          assignments,
          totalCount
        };
      }

      return {
        assignments: [],
        totalCount: 0
      };
    },
    enabled: !!campaignId,
  });

  const assignments = assignmentsData?.assignments || [];
  const totalCount = assignmentsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const sendReminderMutation = useMutation({
    mutationFn: async ({ instanceId, campaignId, assignmentIds }: { instanceId?: string; campaignId: string; assignmentIds: string[] }) => {
      const { error } = await supabase.functions.invoke("send-campaign-instance-reminder", {
        body: {
          assignmentIds,
          campaignId,
          instanceId,
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

  const eligibleAssignmentsCount = selectedAssignments.filter((id) => {
    const assignment = assignments?.find((a) => a.id === id);
    return assignment && canSendReminder(assignment.last_reminder_sent);
  }).length;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedAssignments([]);
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size));
    setCurrentPage(1);
    setSelectedAssignments([]);
  };

  const columns = [
    {
      id: "select",
      header: ({ table }: any) => (
        <TableHeader
          table={table}
          onSelectAll={(value) =>
            setSelectedAssignments(value ? assignments.map((a) => a.id) : [])
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
        <div className="flex flex-col md:flex-row gap-2">
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
          <div className="relative flex items-center">
            <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full max-w-xs"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={pageSize.toString()} 
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          {surveyId && <AssignCampaignUsers surveyId={surveyId} campaignId={campaignId} />}
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={assignments} 
        isLoading={isLoading || isFetching} 
      />
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                // Show first, last, current, and pages around current
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={page === currentPage}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  (page === 2 && currentPage > 3) || 
                  (page === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <span className="flex h-9 items-center justify-center">...</span>
                    </PaginationItem>
                  );
                }
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      
      <div className="text-sm text-muted-foreground text-center">
        Showing {assignments.length} of {totalCount} assignments
      </div>
    </div>
  );
}
