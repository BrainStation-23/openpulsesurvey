
import { supabase } from "@/integrations/supabase/client";
import { UserProfileData, SbuData, SupervisorRelation, SupervisorProfile, DataMaps } from "./types";

/**
 * Fetches user profiles from Supabase
 */
export async function fetchUserProfiles(userIds: string[]): Promise<UserProfileData[]> {
  if (userIds.length === 0) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      email,
      gender,
      location:locations (
        id,
        name
      ),
      employment_type:employment_types (
        id,
        name
      ),
      level:levels (
        id,
        name
      ),
      employee_type:employee_types (
        id,
        name
      ),
      employee_role:employee_roles (
        id,
        name
      )
    `)
    .in('id', userIds);

  if (error) {
    console.error("Error fetching user profiles:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetches SBU data for users from Supabase
 */
export async function fetchSbuData(userIds: string[]): Promise<SbuData[]> {
  if (userIds.length === 0) return [];

  const { data, error } = await supabase
    .from("user_sbus")
    .select(`
      user_id,
      is_primary,
      sbu:sbus (
        id,
        name
      )
    `)
    .in('user_id', userIds);

  if (error) {
    console.error("Error fetching SBU data:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetches supervisor relations for users from Supabase
 */
export async function fetchSupervisorRelations(userIds: string[]): Promise<SupervisorRelation[]> {
  if (userIds.length === 0) return [];

  const { data, error } = await supabase
    .from("user_supervisors")
    .select(`
      user_id,
      is_primary,
      supervisor_id
    `)
    .in('user_id', userIds)
    .eq('is_primary', true);

  if (error) {
    console.error("Error fetching supervisor relations:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetches supervisor profiles from Supabase
 */
export async function fetchSupervisorProfiles(supervisorIds: string[]): Promise<SupervisorProfile[]> {
  if (supervisorIds.length === 0) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .in('id', supervisorIds);

  if (error) {
    console.error("Error fetching supervisor profiles:", error);
    return [];
  }

  return data || [];
}

/**
 * Creates maps for efficient data lookups
 */
export function createDataMaps(
  userProfiles: UserProfileData[],
  sbuData: SbuData[],
  supervisorRelations: SupervisorRelation[],
  supervisorProfiles: SupervisorProfile[]
): DataMaps {
  // Create user map
  const userMap = new Map<string, UserProfileData>();
  userProfiles.forEach(user => {
    userMap.set(user.id, user);
  });

  // Create SBU map
  const sbuMap = new Map<string, SbuData["sbu"]>();
  sbuData.forEach(item => {
    if (item.is_primary && item.sbu) {
      sbuMap.set(item.user_id, item.sbu);
    }
  });

  // Create supervisor map
  const supervisorMap = new Map<string, SupervisorProfile>();
  supervisorRelations.forEach(relation => {
    if (relation.is_primary) {
      const supervisor = supervisorProfiles.find(s => s.id === relation.supervisor_id);
      if (supervisor) {
        supervisorMap.set(relation.user_id, supervisor);
      }
    }
  });

  return {
    userMap,
    sbuMap,
    supervisorMap
  };
}
