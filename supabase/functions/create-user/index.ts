
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { AuthService } from '../_shared/auth-service.ts';
import { ProfileService } from '../_shared/profile-service.ts';
import type { UserCreateData } from '../_shared/db-types.ts';

async function createSingleUser(payload: UserCreateData) {
  console.log('Creating single user:', payload);

  try {
    // Create auth user
    const authResult = await AuthService.createUser(payload);
    if (!authResult.success || !authResult.user) {
      return { success: false, error: authResult.error, email: payload.email };
    }

    // Get IDs for related entities
    const [levelId, locationId, employmentTypeId, employeeRoleId, employeeTypeId] = 
      await Promise.all([
        ProfileService.getLevelId(payload.level),
        ProfileService.getLocationId(payload.location),
        ProfileService.getEmploymentTypeId(payload.employment_type),
        ProfileService.getEmployeeRoleId(payload.employee_role),
        ProfileService.getEmployeeTypeId(payload.employee_type)
      ]);

    // Create profile
    const profileResult = await ProfileService.createProfile({
      id: authResult.user.id,
      email: payload.email,
      first_name: payload.first_name,
      last_name: payload.last_name,
      org_id: payload.org_id,
      level_id: levelId,
      location_id: locationId,
      employment_type_id: employmentTypeId,
      employee_role_id: employeeRoleId,
      employee_type_id: employeeTypeId,
      gender: payload.gender,
      date_of_birth: payload.date_of_birth,
      designation: payload.designation,
    });

    if (!profileResult.success) {
      // Cleanup: delete auth user if profile creation failed
      await AuthService.deleteUser(authResult.user.id);
      return { success: false, error: profileResult.error, email: payload.email };
    }

    // Assign role if admin
    if (payload.is_admin) {
      const roleResult = await ProfileService.assignRole(authResult.user.id, 'admin');
      if (!roleResult.success) {
        await AuthService.deleteUser(authResult.user.id);
        return { success: false, error: roleResult.error, email: payload.email };
      }
    }

    // Assign SBUs if provided
    if (payload.sbus) {
      await ProfileService.assignSBUs(authResult.user.id, payload.sbus);
    }

    return { success: true, userId: authResult.user.id, email: payload.email };
  } catch (error) {
    console.error('User creation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: error,
      email: payload.email
    };
  }
}

async function createBatchUsers(users: UserCreateData[]) {
  console.log('Creating batch users:', users.length);
  const results = [];
  for (const user of users) {
    const result = await createSingleUser(user);
    results.push(result);
  }
  return {
    success: results.some(result => result.success),
    results
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: UserCreateData = await req.json();
    console.log('Received payload:', payload);

    let result;
    if (payload.method === 'BATCH' && payload.users) {
      result = await createBatchUsers(payload.users);
      return new Response(
        JSON.stringify(result.results),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: result.success ? 200 : 400
        }
      );
    } else {
      result = await createSingleUser(payload);
      return new Response(
        JSON.stringify(result),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: result.success ? 200 : 400
        }
      );
    }
  } catch (error) {
    console.error('Request failed:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
