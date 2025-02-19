
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id } = await req.json()

    if (!user_id) {
      throw new Error('User ID is required');
    }

    console.log('Starting user deletion process for user:', user_id);

    // Step 1: Remove all auth sessions
    console.log('Removing auth sessions...');
    const { error: sessionError } = await supabaseClient
      .from('auth.sessions')
      .delete()
      .eq('user_id', user_id);

    if (sessionError) {
      console.error('Error deleting sessions:', sessionError);
      // Continue with deletion even if session deletion fails
    }

    // Step 2: Remove MFA factors
    console.log('Removing MFA factors...');
    const { error: mfaError } = await supabaseClient
      .from('auth.mfa_factors')
      .delete()
      .eq('user_id', user_id);

    if (mfaError) {
      console.error('Error deleting MFA factors:', mfaError);
      // Continue with deletion even if MFA deletion fails
    }

    // Step 3: Remove identities
    console.log('Removing auth identities...');
    const { error: identityError } = await supabaseClient
      .from('auth.identities')
      .delete()
      .eq('user_id', user_id);

    if (identityError) {
      console.error('Error deleting identities:', identityError);
      // Continue with deletion even if identity deletion fails
    }

    // Step 4: Delete the auth user
    console.log('Deleting auth user...');
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user_id);

    if (deleteError) {
      console.error('Error deleting auth user:', deleteError);
      throw deleteError;
    }

    console.log('User deletion completed successfully');

    return new Response(
      JSON.stringify({ 
        message: 'User deleted successfully'
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error deleting user'
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    )
  }
})
