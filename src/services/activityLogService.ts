
import { supabase } from "@/integrations/supabase/client";

interface ActivityLogParams {
  userId: string;
  activityType: string;
  description: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

// Get client IP address (will be limited by browser capabilities)
const getClientIpAddress = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP address:', error);
    return '';
  }
};

// Create a new activity log entry
export const createActivityLog = async ({
  userId,
  activityType,
  description,
  ipAddress,
  metadata = {}
}: ActivityLogParams): Promise<string | null> => {
  try {
    if (!userId) {
      console.error('User ID is required for activity logging');
      return null;
    }
    
    // If IP address wasn't provided, try to get it
    const ip = ipAddress || await getClientIpAddress();
    
    try {
      // Use the properly created RPC function
      const { data, error } = await supabase.rpc('create_activity_log', {
        p_user_id: userId,
        p_activity_type: activityType,
        p_description: description,
        p_ip_address: ip,
        p_metadata: metadata
      });
      
      if (error) {
        console.error('Error in create_activity_log RPC:', error);
        
        // Fallback to direct insert if RPC fails
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        
        // Use direct URL instead of accessing protected properties
        const apiUrl = 'https://bdnbcaiqgumzsujkbsmp.supabase.co/rest/v1/user_activity_logs';
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkbmJjYWlxZ3VtenN1amtic21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5OTI4NjEsImV4cCI6MjA1NjU2ODg2MX0.A7p4dTY3GPSOpXTnzF1FwyvHtm6TqEayCgf3ekWbBt0',
            'Authorization': token ? `Bearer ${token}` : '',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            user_id: userId,
            activity_type: activityType,
            description: description,
            ip_address: ip,
            metadata: metadata
          })
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        return result[0]?.id || null;
      }
      
      // Handle the return value from the RPC function
      return data as string;
    } catch (apiError) {
      console.error('API error in createActivityLog:', apiError);
      return null;
    }
  } catch (error) {
    console.error('Error in createActivityLog:', error);
    return null;
  }
};

// Log authentication events (login, logout, etc.)
export const logAuthEvent = async (
  userId: string, 
  eventType: 'login' | 'logout' | 'register' | 'password_reset' | 'password_change',
  metadata: Record<string, any> = {}
): Promise<void> => {
  try {
    const descriptions = {
      login: 'User logged in',
      logout: 'User logged out',
      register: 'User registered',
      password_reset: 'User reset password',
      password_change: 'User changed password'
    };
    
    await createActivityLog({
      userId,
      activityType: `auth.${eventType}`,
      description: descriptions[eventType],
      metadata: {
        ...metadata,
        user_agent: navigator.userAgent
      }
    });
  } catch (error) {
    console.error(`Error logging ${eventType} event:`, error);
  }
};

// Log survey activity
export const logSurveyActivity = async (
  userId: string,
  action: 'started' | 'completed' | 'abandoned',
  surveyId: string,
  surveyName: string,
  completionPercentage?: number
): Promise<void> => {
  try {
    const descriptions = {
      started: 'User started a survey',
      completed: 'User completed a survey',
      abandoned: 'User abandoned a survey'
    };
    
    await createActivityLog({
      userId,
      activityType: `survey.${action}`,
      description: descriptions[action],
      metadata: {
        survey_id: surveyId,
        survey_name: surveyName,
        completion_percentage: completionPercentage || 0
      }
    });
  } catch (error) {
    console.error(`Error logging survey.${action} event:`, error);
  }
};

// Log achievement unlocks
export const logAchievementUnlock = async (
  userId: string,
  achievementName: string,
  points: number,
  category: string
): Promise<void> => {
  try {
    await createActivityLog({
      userId,
      activityType: 'achievement.unlocked',
      description: `User unlocked the "${achievementName}" achievement`,
      metadata: {
        achievement_name: achievementName,
        points,
        category
      }
    });
  } catch (error) {
    console.error('Error logging achievement unlock:', error);
  }
};

// Log security-related events
export const logSecurityEvent = async (
  userId: string,
  eventType: string,
  description: string,
  metadata: Record<string, any> = {}
): Promise<void> => {
  try {
    await createActivityLog({
      userId,
      activityType: `security.${eventType}`,
      description,
      metadata
    });
  } catch (error) {
    console.error(`Error logging security.${eventType} event:`, error);
  }
};

// Log OKR-related activities
export const logOkrActivity = async (
  userId: string,
  action: string,
  entityType: 'objective' | 'key_result' | 'alignment',
  entityId: string,
  entityName: string,
  additionalData: Record<string, any> = {}
): Promise<void> => {
  try {
    await createActivityLog({
      userId,
      activityType: `okr.${entityType}.${action}`,
      description: `User ${action} ${entityType}: ${entityName}`,
      metadata: {
        entity_id: entityId,
        entity_name: entityName,
        ...additionalData
      }
    });
  } catch (error) {
    console.error(`Error logging okr.${entityType}.${action} event:`, error);
  }
};
