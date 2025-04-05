
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
    
    // Using the raw query approach to avoid typing issues
    const query = `
      INSERT INTO user_activity_logs (user_id, activity_type, description, ip_address, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    
    const { data, error } = await supabase.rpc('execute_sql', {
      query_text: query,
      query_params: [userId, activityType, description, ip, JSON.stringify(metadata)]
    });
    
    if (error) {
      console.error('Error creating activity log using RPC:', error);
      
      // Fallback to a direct insert as text
      try {
        // This is a last resort approach - may not work if RLS is strict
        const { data: rawResult } = await supabase.auth.getSession();
        const authHeader = rawResult.session?.access_token 
          ? { Authorization: `Bearer ${rawResult.session.access_token}` }
          : {};
          
        const response = await fetch(`${supabase.supabaseUrl}/rest/v1/user_activity_logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabase.supabaseKey,
            ...authHeader
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
        
        const responseData = await response.json();
        return responseData.id;
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        return null;
      }
    }
    
    return data?.results?.[0]?.id || null;
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
