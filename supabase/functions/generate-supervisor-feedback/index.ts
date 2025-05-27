
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Create service role client for database operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { campaignId, instanceId } = await req.json();

    console.log(`Processing AI feedback generation for campaign ${campaignId}, instance ${instanceId}`);

    // Get supervisors with minimum 4 reportees
    const { data: supervisorsData, error: supervisorsError } = await supabaseClient
      .rpc('get_supervisors_with_min_reportees', { min_reportees: 4 });

    if (supervisorsError) {
      console.error('Error fetching supervisors:', supervisorsError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to fetch supervisors'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!supervisorsData || supervisorsData.length === 0) {
      console.log('No supervisors with minimum reportees found');
      return new Response(JSON.stringify({
        success: true,
        message: 'No supervisors with minimum reportees found',
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${supervisorsData.length} supervisors to process`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process each supervisor with a delay to avoid rate limits
    for (let i = 0; i < supervisorsData.length; i++) {
      const supervisor = supervisorsData[i];
      
      try {
        console.log(`Processing supervisor ${supervisor.supervisor_id} (${i + 1}/${supervisorsData.length})`);

        // Check if analysis already exists
        const { data: existingAnalysis, error: checkError } = await supabaseClient
          .from('ai_feedback_analysis')
          .select('id')
          .eq('campaign_id', campaignId)
          .eq('instance_id', instanceId)
          .eq('supervisor_id', supervisor.supervisor_id)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error(`Error checking existing analysis for supervisor ${supervisor.supervisor_id}:`, checkError);
          errorCount++;
          errors.push({ supervisor_id: supervisor.supervisor_id, error: checkError.message });
          continue;
        }

        if (existingAnalysis) {
          console.log(`Analysis already exists for supervisor ${supervisor.supervisor_id}, skipping`);
          continue;
        }

        // Call the analyze-reportee-feedback function
        const { data: analysisResult, error: analysisError } = await supabaseClient.functions
          .invoke('analyze-reportee-feedback', {
            body: {
              campaignId,
              instanceId,
              supervisorId: supervisor.supervisor_id
            }
          });

        if (analysisError) {
          console.error(`Error generating analysis for supervisor ${supervisor.supervisor_id}:`, analysisError);
          errorCount++;
          errors.push({ supervisor_id: supervisor.supervisor_id, error: analysisError.message });
        } else if (analysisResult?.success) {
          console.log(`Successfully generated analysis for supervisor ${supervisor.supervisor_id}`);
          successCount++;
        } else {
          console.error(`Analysis failed for supervisor ${supervisor.supervisor_id}:`, analysisResult);
          errorCount++;
          errors.push({ supervisor_id: supervisor.supervisor_id, error: analysisResult?.error || 'Unknown error' });
        }

        // Add delay between requests to avoid overwhelming the system
        if (i < supervisorsData.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }

      } catch (error) {
        console.error(`Unexpected error processing supervisor ${supervisor.supervisor_id}:`, error);
        errorCount++;
        errors.push({ supervisor_id: supervisor.supervisor_id, error: error.message });
      }
    }

    console.log(`Completed processing: ${successCount} successful, ${errorCount} errors`);

    return new Response(JSON.stringify({
      success: true,
      processed: supervisorsData.length,
      successful: successCount,
      errors: errorCount,
      errorDetails: errors
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in generate-supervisor-feedback function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
