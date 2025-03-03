import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { ProfileData } from './db-types.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class ProfileService {
  static async updateProfile(profileData: ProfileData): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          org_id: profileData.org_id,
        })
        .eq('id', profileData.id);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  }
}
