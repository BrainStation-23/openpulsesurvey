
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

    console.log('Processing AI analysis queue...');

    // Call the database function to process the queue
    const { data, error } = await supabaseClient.rpc('process_ai_analysis_queue');

    if (error) {
      console.error('Error processing AI analysis queue:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to process AI analysis queue',
        details: error.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const processedCount = data || 0;
    console.log(`Successfully processed ${processedCount} AI analysis jobs`);

    // Get current queue stats
    const { data: queueStats, error: statsError } = await supabaseClient
      .from('ai_analysis_queue')
      .select('status')
      .then(result => {
        if (result.error) throw result.error;
        
        const stats = result.data.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        return { data: stats, error: null };
      });

    if (statsError) {
      console.error('Error fetching queue stats:', statsError);
    }

    return new Response(JSON.stringify({
      success: true,
      processed_count: processedCount,
      queue_stats: queueStats || {}
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error in process-ai-analysis-queue function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
