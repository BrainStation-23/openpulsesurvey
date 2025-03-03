
import { createClient } from '@supabase/supabase-js';
import { ProfileData, UserRole } from './db-types';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class ProfileService {
  static async createProfile(profileData: ProfileData): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: profileData.id,
          email: profileData.email,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          org_id: profileData.org_id,
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error creating profile:', error);
      return { success: false, error: error.message };
    }
  }

  static async assignRole(userId: string, role: UserRole): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role,
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error assigning role:', error);
      return { success: false, error: error.message };
    }
  }
}
