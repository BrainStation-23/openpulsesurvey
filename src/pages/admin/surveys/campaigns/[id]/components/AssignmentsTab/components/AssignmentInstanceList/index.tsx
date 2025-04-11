
import { SurveyAssignment } from "@/pages/admin/surveys/types/assignments";
import { AssignCampaignUsers } from "../AssignCampaignUsers";
import { DataTable } from "@/components/ui/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import { TableHeader } from "./components/TableHeader";
import { AssignmentActions } from "./components/AssignmentActions";
import { UserCell } from "./components/UserCell";
import { AssignmentFilters } from "./components/AssignmentFilters";
import { BulkActions } from "./components/BulkActions";
import { PageSizeSelector } from "./components/PageSizeSelector";
import { PaginationControls } from "./components/PaginationControls";
import { useAssignmentData } from "./hooks/useAssignmentData";

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
  const {
    assignments,
    isLoading,
    isFetching,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    statusFilter,
    searchTerm,
    selectedAssignments,
    eligibleAssignmentsCount,
    sendReminderMutation,
    sendAssignmentNotificationMutation,
    canSendReminder,
    getNextReminderTime,
    setStatusFilter,
    setSearchTerm,
    setSelectedAssignments,
    handlePageChange,
    handlePageSizeChange
  } = useAssignmentData({ campaignId, selectedInstanceId });

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
            <BulkActions
              selectedAssignments={selectedAssignments}
              eligibleAssignmentsCount={eligibleAssignmentsCount}
              sendReminderMutation={sendReminderMutation}
              sendAssignmentNotificationMutation={sendAssignmentNotificationMutation}
              campaignId={campaignId}
              selectedInstanceId={selectedInstanceId}
            />
            <AssignmentFilters
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PageSizeSelector
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
          {surveyId && <AssignCampaignUsers surveyId={surveyId} campaignId={campaignId} />}
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={assignments} 
        isLoading={isLoading || isFetching} 
      />
      
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalCount={totalCount}
        itemsOnPage={assignments.length}
      />
    </div>
  );
}

// Import used components 
import {
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
  Tooltip,
} from "@/components/ui/tooltip";
