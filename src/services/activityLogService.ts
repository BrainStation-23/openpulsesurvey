
import { supabase } from "@/integrations/supabase/client";
import { ActivityLogEntry } from "@/types/activity-log";

// Function to create an activity log entry
export async function createActivityLog(
  userId: string,
  entityType: string,
  entityId: string,
  action: string,
  details?: any
): Promise<boolean> {
  try {
    // Use executeQuery instead of trying to access the table directly
    const { error } = await supabase.rpc('create_activity_log_entry', {
      p_user_id: userId,
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_action: action,
      p_details: details || {}
    });
    
    if (error) {
      console.error("Error creating activity log:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Failed to create activity log:", error);
    return false;
  }
}

// Function to fetch activity logs
export async function fetchActivityLogs({
  page = 1,
  pageSize = 10,
  entityType,
  userId,
  startDate,
  endDate,
}: {
  page?: number;
  pageSize?: number;
  entityType?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<{ data: ActivityLogEntry[]; count: number }> {
  try {
    // Use a stored procedure to fetch the logs
    const { data, error } = await supabase.rpc('fetch_activity_logs', {
      p_page: page,
      p_page_size: pageSize,
      p_entity_type: entityType || null,
      p_user_id: userId || null,
      p_start_date: startDate ? startDate.toISOString() : null,
      p_end_date: endDate ? endDate.toISOString() : null
    });
    
    if (error) {
      console.error("Error fetching activity logs:", error);
      return { data: [], count: 0 };
    }
    
    // Process the response which will come as an array with the first item containing
    // our results and count
    if (Array.isArray(data) && data.length > 0) {
      const result = data[0] as { logs: ActivityLogEntry[], total_count: number };
      return {
        data: result.logs || [],
        count: result.total_count || 0
      };
    }
    
    return { data: [], count: 0 };
  } catch (error) {
    console.error("Failed to fetch activity logs:", error);
    return { data: [], count: 0 };
  }
}
