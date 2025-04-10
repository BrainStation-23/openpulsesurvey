
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
    // Use a direct database insert with explicit column names
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
        action: action,
        details: details || {}
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

// Function to fetch activity logs with proper URL construction
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
    // Calculate range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Build the query
    let query = supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    
    // Apply filters if provided
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      console.error("Error fetching activity logs:", error);
      return { data: [], count: 0 };
    }
    
    // Safely convert the returned data to ActivityLogEntry[]
    // Use type assertion with unknown first to avoid TypeScript errors
    return {
      data: (data as unknown) as ActivityLogEntry[],
      count: count || 0
    };
  } catch (error) {
    console.error("Failed to fetch activity logs:", error);
    return { data: [], count: 0 };
  }
}
