
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SurveyAssignment } from "@/pages/admin/surveys/types/assignments";

interface UseAssignmentDataProps {
  campaignId: string;
  selectedInstanceId?: string;
}

export function useAssignmentData({ campaignId, selectedInstanceId }: UseAssignmentDataProps) {
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
      
      const { data, error } = await supabase.rpc("get_paginated_campaign_assignments", {
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

      if (data && Array.isArray(data) && data.length > 0) {
        const totalCount = data[0]?.total_count || 0;
        const assignments = data.map((assignment) => ({
          ...assignment,
          status: assignment.status,
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

  const sendAssignmentNotificationMutation = useMutation({
    mutationFn: async ({ instanceId, campaignId, assignmentIds }: { instanceId?: string; campaignId: string; assignmentIds: string[] }) => {
      const { error } = await supabase.functions.invoke("send-campaign-assignment-notification", {
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
      toast.success("Assignment notifications sent successfully");
      queryClient.invalidateQueries({ queryKey: ["campaign-assignments"] });
      setSelectedAssignments([]);
    },
    onError: (error) => {
      console.error("Error sending assignment notifications:", error);
      toast.error("Failed to send assignment notifications");
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

  return {
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
  };
}
