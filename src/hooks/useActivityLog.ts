
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchActivityLogs } from "@/services/activityLogService";
import { ActivityLogEntry } from "@/types/activity-log";

export type ActivityLogFilter = {
  entityType?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
};

export function useActivityLog(initialFilters: ActivityLogFilter = {}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<ActivityLogFilter>(initialFilters);
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['activityLogs', page, pageSize, filters],
    queryFn: async () => {
      return fetchActivityLogs({
        page,
        pageSize,
        ...filters
      });
    }
  });
  
  const logs = data?.data || [];
  const totalCount = data?.count || 0;
  
  // Extract unique entity types and user IDs from logs
  // Filter out null/undefined values and explicitly type as string[]
  const entityTypes = Array.from(
    new Set(
      logs
        .map(log => log.entity_type)
        .filter((type): type is string => !!type)
    )
  );
  
  const userIds = Array.from(
    new Set(
      logs
        .map(log => log.user_id)
        .filter((id): id is string => !!id)
    )
  );
  
  // Helper function to handle filter changes
  const updateFilters = (newFilters: Partial<ActivityLogFilter>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    setPage(1); // Reset to first page when filters change
  };
  
  return {
    logs,
    totalCount,
    isLoading,
    error,
    page,
    pageSize,
    filters,
    setPage,
    setPageSize,
    updateFilters,
    refetch,
    entityTypes,
    userIds
  };
}
