
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { ProfileData } from './db-types.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class ProfileService {
  static async getLocationId(locationName?: string): Promise<string | null> {
    if (!locationName) return null;
    const { data } = await supabase
      .from("locations")
      .select("id")
      .eq("name", locationName)
      .maybeSingle();
    return data?.id || null;
  }

  static async getLevelId(levelName?: string): Promise<string | null> {
    if (!levelName) return null;
    const { data } = await supabase
      .from("levels")
      .select("id")
      .eq("name", levelName)
      .eq("status", "active")
      .maybeSingle();
    return data?.id || null;
  }

  static async getEmploymentTypeId(typeName?: string): Promise<string | null> {
    if (!typeName) return null;
    const { data } = await supabase
      .from("employment_types")
      .select("id")
      .eq("name", typeName)
      .eq("status", "active")
      .maybeSingle();
    return data?.id || null;
  }

  static async getEmployeeRoleId(roleName?: string): Promise<string | null> {
    if (!roleName) return null;
    const { data } = await supabase
      .from("employee_roles")
      .select("id")
      .eq("name", roleName)
      .eq("status", "active")
      .maybeSingle();
    return data?.id || null;
  }

  static async getEmployeeTypeId(typeName?: string): Promise<string | null> {
    if (!typeName) return null;
    const { data } = await supabase
      .from("employee_types")
      .select("id")
      .eq("name", typeName)
      .eq("status", "active")
      .maybeSingle();
    return data?.id || null;
  }

  static async assignSBUs(userId: string, sbuString?: string): Promise<void> {
    if (!sbuString) return;
    const sbuNames = sbuString.split(";").map(s => s.trim());
    const { data: sbus } = await supabase
      .from("sbus")
      .select("id, name")
      .in("name", sbuNames);
    
    if (!sbus?.length) return;

    const assignments = sbus.map((sbu, index) => ({
      user_id: userId,
      sbu_id: sbu.id,
      is_primary: index === 0,
    }));

    await supabase.from("user_sbus").insert(assignments);
  }

  static async createProfile(profileData: ProfileData): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          org_id: profileData.org_id,
          level_id: profileData.level_id,
          location_id: profileData.location_id,
          employment_type_id: profileData.employment_type_id,
          employee_role_id: profileData.employee_role_id,
          employee_type_id: profileData.employee_type_id,
          gender: profileData.gender,
          date_of_birth: profileData.date_of_birth,
          designation: profileData.designation,
        })
        .eq('id', profileData.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error creating profile:', error);
      return { success: false, error: error.message };
    }
  }

  static async assignRole(userId: string, role: 'admin' | 'user'): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role })
        .eq("user_id", userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error assigning role:', error);
      return { success: false, error: error.message };
    }
  }
}
