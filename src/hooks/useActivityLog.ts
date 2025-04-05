
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
        
      // Using a raw query approach to avoid typing issues
      let query = `
        SELECT 
          al.*,
          p.email as profile_email,
          p.first_name as profile_first_name,
          p.last_name as profile_last_name
        FROM 
          user_activity_logs al
        LEFT JOIN
          profiles p ON al.user_id = p.id
        WHERE 
          1=1
      `;
      
      const queryParams: any[] = [];
      let paramCounter = 1;
      
      // Add date filter if needed
      if (startDate) {
        query += ` AND al.created_at >= $${paramCounter}`;
        queryParams.push(startDate);
        paramCounter++;
      }
      
      // Add user filter if needed
      if (userId) {
        query += ` AND al.user_id = $${paramCounter}`;
        queryParams.push(userId);
        paramCounter++;
      }
      
      // Add activity type filter if needed
      if (activityType) {
        query += ` AND al.activity_type = $${paramCounter}`;
        queryParams.push(activityType);
        paramCounter++;
      }
      
      // Add search filter if needed
      if (searchTerm) {
        query += ` AND (al.description ILIKE $${paramCounter} OR al.activity_type ILIKE $${paramCounter})`;
        queryParams.push(`%${searchTerm}%`);
        paramCounter++;
      }
      
      // Add ordering
      query += ` ORDER BY al.created_at DESC`;
      
      // Add limit
      query += ` LIMIT $${paramCounter}`;
      queryParams.push(isAdminView ? 100 : 50);
      
      // Execute the query
      const { data, error } = await supabase.rpc('execute_sql', {
        query_text: query,
        query_params: queryParams
      });
      
      if (error) {
        console.error('Error fetching activity logs:', error);
        
        // Fallback approach if execute_sql is not available
        try {
          const { data: rawData, error: rawError } = await supabase
            .from('user_activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(isAdminView ? 100 : 50);
            
          if (rawError) throw rawError;
          return rawData.map((log: any) => ({
            ...log,
            user_details: null
          }));
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
          throw fallbackError;
        }
      }
      
      // Format the response with user details if available
      return (data?.results || []).map((log: any) => ({
        ...log,
        user_details: {
          email: log.profile_email,
          full_name: log.profile_first_name && log.profile_last_name 
            ? `${log.profile_first_name} ${log.profile_last_name}`
            : null
        }
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
