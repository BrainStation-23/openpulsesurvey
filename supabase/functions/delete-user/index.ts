
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the user ID from the request body
    const { user_id } = await req.json()

    if (!user_id) {
      throw new Error('user_id is required')
    }

    console.log('Starting user deletion process for user:', user_id);

    // Use the built-in admin.deleteUser method
    const { error } = await supabaseClient.auth.admin.deleteUser(
      user_id
    )

    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }

    console.log('User deletion completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User deleted successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in delete-user function:', error);

    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
