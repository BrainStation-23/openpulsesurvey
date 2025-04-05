
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface ActivityLogQueryParams {
  userId?: string;
  activityType?: string;
  period: number;
  searchTerm?: string;
  isAdminView?: boolean;
}

export interface ActivityLog {
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
      
      try {
        // Build query parameters
        let query: Record<string, string> = {};
        
        if (startDate) {
          query = { ...query, created_at: `gte.${startDate}` };
        }
        if (userId) {
          query = { ...query, user_id: `eq.${userId}` };
        }
        if (activityType) {
          query = { ...query, activity_type: `eq.${activityType}` };
        }
        
        // Convert query to URL params for the REST API approach
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(query)) {
          params.append(key, value);
        }
        
        if (searchTerm) {
          params.append('or', `(description.ilike.%${searchTerm}%,activity_type.ilike.%${searchTerm}%)`);
        }
        
        params.append('order', 'created_at.desc');
        params.append('limit', isAdminView ? '100' : '50');
        
        // Use fetch with proper authorization
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        
        // Get the API URL from environment or use a fixed domain based on project reference
        const apiUrl = `https://bdnbcaiqgumzsujkbsmp.supabase.co/rest/v1/user_activity_logs?${params.toString()}`;
        
        const response = await fetch(apiUrl, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkbmJjYWlxZ3VtenN1amtic21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5OTI4NjEsImV4cCI6MjA1NjU2ODg2MX0.A7p4dTY3GPSOpXTnzF1FwyvHtm6TqEayCgf3ekWbBt0',
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          }
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const rawLogs = await response.json();
        
        // If we need user details, fetch profiles for user IDs
        if (rawLogs.length > 0) {
          // Get unique user IDs from logs
          const userIds = [...new Set(rawLogs.map((log: any) => log.user_id))];
          
          // Fetch user profiles for these IDs
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email, first_name, last_name')
            .in('id', userIds);
          
          // Create a lookup map
          const userMap: Record<string, any> = {};
          if (profiles) {
            profiles.forEach(profile => {
              userMap[profile.id] = profile;
            });
          }
          
          // Enhance logs with user details
          return rawLogs.map((log: any) => ({
            ...log,
            user_details: userMap[log.user_id] ? {
              email: userMap[log.user_id].email,
              full_name: userMap[log.user_id].first_name && userMap[log.user_id].last_name 
                ? `${userMap[log.user_id].first_name} ${userMap[log.user_id].last_name}`
                : null
            } : null
          }));
        }
        
        return rawLogs;
      } catch (error) {
        console.error('Error fetching activity logs:', error);
        return [];
      }
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
