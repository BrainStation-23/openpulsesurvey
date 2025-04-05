
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface ActivityLogQueryParams {
  userId?: string;
  activityType?: string;
  period: number;
  searchTerm?: string;
  isAdminView?: boolean;
}

interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  ip_address: string;
  metadata?: any;
  created_at: string;
  user_details?: {
    email?: string;
    full_name?: string;
  };
}

interface User {
  id: string;
  email?: string;
}

export const useActivityLog = ({
  userId,
  activityType,
  period,
  searchTerm,
  isAdminView = false
}: ActivityLogQueryParams) => {
  // Period options for filtering
  const periodOptions = [
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" },
    { value: "365", label: "Last year" },
    { value: "0", label: "All time" }
  ];

  // Query for activity logs
  const { data: activityLogs = [], isLoading } = useQuery({
    queryKey: ['activity-logs', userId, activityType, period, searchTerm, isAdminView],
    queryFn: async () => {
      // Calculate the date range based on period
      const startDate = period > 0
        ? new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString()
        : null;
        
      // Start building the query - using raw SQL to avoid type issues
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select(`
          *,
          profiles:user_id (
            email,
            first_name,
            last_name
          )
        `)
        .gte('created_at', startDate || '1900-01-01')
        .eq(userId ? 'user_id' : 'id', userId || 'id') // Only apply user filter if userId is provided
        .eq(activityType ? 'activity_type' : 'id', activityType || 'id') // Only apply activity type filter if provided
        .or(searchTerm ? `description.ilike.%${searchTerm}%,activity_type.ilike.%${searchTerm}%` : 'id.eq.id')
        .order('created_at', { ascending: false })
        .limit(isAdminView ? 100 : 50);
      
      if (error) {
        console.error('Error fetching activity logs:', error);
        throw error;
      }
      
      // Format the response with user details if available
      return data.map((log: any) => ({
        ...log,
        user_details: log.profiles ? {
          email: log.profiles.email,
          full_name: log.profiles.first_name && log.profiles.last_name 
            ? `${log.profiles.first_name} ${log.profiles.last_name}`
            : null
        } : null
      }));
    },
    enabled: isAdminView || !!userId // Only run if we're in admin view or have a user ID
  });

  // Extract unique activity types for filter dropdown
  const activityTypes = activityLogs && activityLogs.length > 0 
    ? [...new Set(activityLogs.map((log: ActivityLog) => log.activity_type))] 
    : [];
  
  // Get user list for admin view
  const { data: userList = [] } = useQuery({
    queryKey: ['activity-log-users'],
    queryFn: async () => {
      if (!isAdminView) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .order('email');
        
      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }
      
      return data;
    },
    enabled: isAdminView
  });

  return {
    activityLogs,
    isLoading,
    activityTypes,
    periodOptions,
    userList
  };
};
