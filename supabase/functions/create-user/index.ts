
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';
import { AuthService } from '../_shared/auth-service.ts';
import { ProfileService } from '../_shared/profile-service.ts';
import type { UserCreateData } from '../_shared/db-types.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { method, ...userData } = await req.json();
    console.log('Received user creation request:', { method, ...userData });

    // Handle batch creation
    if (method === 'BATCH') {
      const results = [];
      for (const user of userData.users) {
        results.push(await createSingleUser(user));
      }
      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle single user creation
    const result = await createSingleUser(userData);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createSingleUser(userData: UserCreateData) {
  // Create auth user
  const authResult = await AuthService.createUser(userData);
  if (!authResult.success || !authResult.user) {
    return { success: false, error: authResult.error };
  }

  // Create profile
  const profileResult = await ProfileService.createProfile({
    id: authResult.user.id,
    email: authResult.user.email,
    first_name: userData.first_name,
    last_name: userData.last_name,
  });

  if (!profileResult.success) {
    // Cleanup: delete auth user if profile creation failed
    await AuthService.deleteUser(authResult.user.id);
    return { success: false, error: profileResult.error };
  }

  // Assign role
  const roleResult = await ProfileService.assignRole(
    authResult.user.id,
    userData.is_admin ? 'admin' : 'user'
  );

  if (!roleResult.success) {
    // Cleanup: delete auth user and profile if role assignment failed
    await AuthService.deleteUser(authResult.user.id);
    return { success: false, error: roleResult.error };
  }

  return {
    success: true,
    user: authResult.user,
  };
}
