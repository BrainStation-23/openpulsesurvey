
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseAssignmentDataProps {
  campaignId: string;
  selectedInstanceId?: string;
}

export function useAssignmentData({ campaignId, selectedInstanceId }: UseAssignmentDataProps) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, pageSize]);

  // Clear selected assignments when campaign or instance changes
  useEffect(() => {
    setSelectedAssignments([]);
  }, [campaignId, selectedInstanceId]);

  // Fetch assignments with pagination and filters
  const {
    data: assignmentsData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      "campaign-assignments",
      campaignId,
      selectedInstanceId,
      currentPage,
      pageSize,
      statusFilter,
      searchTerm,
    ],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_paginated_campaign_assignments", {
        p_campaign_id: campaignId,
        p_instance_id: selectedInstanceId,
        p_status: statusFilter,
        p_search_term: searchTerm || null,
        p_page: currentPage,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data;
    },
  });

  // Helper function to determine if a reminder can be sent
  const canSendReminder = (lastReminderSent: string | null) => {
    if (!lastReminderSent) return true;

    const lastSentDate = new Date(lastReminderSent);
    const currentDate = new Date();
    
    // Calculate if 12 hours have passed since last reminder
    const hoursSinceLastReminder = (currentDate.getTime() - lastSentDate.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastReminder >= 12;
  };

  // Helper function to format next available reminder time
  const getNextReminderTime = (lastReminderSent: string) => {
    if (!lastReminderSent) return "now";

    const lastSentDate = new Date(lastReminderSent);
    const nextAvailableTime = new Date(lastSentDate.getTime() + 12 * 60 * 60 * 1000);
    
    return nextAvailableTime.toLocaleString();
  };

  // Calculate how many selected assignments are eligible for reminders
  const eligibleAssignmentsCount = useMemo(() => {
    if (!assignmentsData) return 0;
    
    return assignmentsData
      .filter(a => selectedAssignments.includes(a.id))
      .filter(a => a.status !== "submitted" && canSendReminder(a.last_reminder_sent))
      .length;
  }, [assignmentsData, selectedAssignments, canSendReminder]);

  // Extract assignments and pagination info
  const assignments = assignmentsData || [];
  const totalCount = assignments[0]?.total_count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Send reminder mutation
  const sendReminderMutation = useMutation({
    mutationFn: async ({ assignmentIds, campaignId, instanceId }: { 
      assignmentIds: string[]; 
      campaignId: string; 
      instanceId?: string; 
    }) => {
      console.log("Sending reminders for assignments:", {
        assignmentIds,
        campaignId,
        instanceId,
      });

      const { error } = await supabase.functions.invoke("send-campaign-instance-reminder", {
        body: {
          assignmentIds,
          campaignId,
          instanceId,
          frontendUrl: window.location.origin,
        },
      });

      if (error) {
        console.error("Error sending reminders:", error);
        throw error;
      }
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

  // Send assignment notification mutation
  const sendAssignmentNotificationMutation = useMutation({
    mutationFn: async ({ assignmentIds, campaignId, instanceId, customMessage }: { 
      assignmentIds: string[]; 
      campaignId: string; 
      instanceId?: string;
      customMessage?: string;
    }) => {
      console.log("Sending assignment notifications:", {
        assignmentIds,
        campaignId,
        instanceId,
        hasCustomMessage: !!customMessage,
      });

      const { error } = await supabase.functions.invoke("send-campaign-assignment-notification", {
        body: {
          assignmentIds,
          campaignId,
          instanceId,
          frontendUrl: window.location.origin,
          customMessage,
        },
      });

      if (error) {
        console.error("Error sending assignment notifications:", error);
        throw error;
      }
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

  // Page change handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Page size change handler
  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size));
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
    handlePageSizeChange,
  };
}
