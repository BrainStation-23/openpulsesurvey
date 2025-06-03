
import { supabase } from '@/integrations/supabase/client';
import { getDeviceInfo, getNetworkInfo, getLocationInfo, getClientIP } from '@/utils/deviceInfo';

export type LoginMethod = 'email_password' | 'magic_link' | 'oauth_azure' | 'oauth_google';

export interface LoginAttempt {
  userId?: string;
  email: string;
  loginMethod: LoginMethod;
  success: boolean;
  errorMessage?: string;
  sessionId?: string;
}

export const logLoginAttempt = async (attempt: LoginAttempt): Promise<void> => {
  try {
    // Collect device and network information
    const deviceInfo = getDeviceInfo();
    const networkInfo = getNetworkInfo();
    const locationInfo = getLocationInfo();
    const ipAddress = await getClientIP();

    // Call the Supabase function to log the attempt
    const { error } = await supabase.rpc('log_login_attempt', {
      p_user_id: attempt.userId || null,
      p_email: attempt.email,
      p_login_method: attempt.loginMethod,
      p_success: attempt.success,
      p_error_message: attempt.errorMessage || null,
      p_ip_address: ipAddress,
      p_user_agent: navigator.userAgent,
      p_device_info: JSON.parse(JSON.stringify(deviceInfo)),
      p_network_info: JSON.parse(JSON.stringify(networkInfo)),
      p_location_info: JSON.parse(JSON.stringify(locationInfo)),
      p_session_id: attempt.sessionId || null,
    });

    if (error) {
      console.error('Failed to log login attempt:', error);
    }
  } catch (error) {
    console.error('Error logging login attempt:', error);
  }
};

export const getLoginHistory = async (page: number = 1, pageSize: number = 10) => {
  const { data, error } = await supabase
    .from('login_history')
    .select('*')
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    throw error;
  }

  return data;
};
