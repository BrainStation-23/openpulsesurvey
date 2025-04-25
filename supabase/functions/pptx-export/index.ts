
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import PptxGenJS from "https://esm.sh/pptxgenjs@3.12.0";
import { corsHeaders } from "./utils/helpers.ts";
import { createTitleSlide, createCompletionSlide, createTrendsSlide } from "./utils/slides.ts";
import { fetchCampaignData } from "./utils/fetchResponses.ts";

interface ExportConfig {
  dimensions?: string[];
  theme?: any;
  includeTitle?: boolean;
  includeCompletionRate?: boolean;
  includeResponseTrends?: boolean;
  includeTextResponses?: boolean;
  fileName?: string;
  company?: string;
  author?: string;
}

async function generatePptx(
  campaignId: string, 
  instanceId: string | null,
  config: ExportConfig = {},
  onProgress?: (progress: number) => void
) {
  console.log(`Starting PPTX generation for campaign ${campaignId}, instance ${instanceId}`);
  
  // Initialize presentation
  const pptx = new PptxGenJS();
  pptx.author = config.author || "Survey System";
  pptx.company = config.company || "Your Company";
  
  try {
    // Fetch campaign data
    const campaignData = await fetchCampaignData(campaignId, instanceId);
    if (!campaignData) throw new Error("Failed to fetch campaign data");
    
    // Use campaign name for title if not explicitly set
    pptx.title = config.fileName || campaignData.name;
    
    // Create title slide
    if (config.includeTitle !== false) {
      await createTitleSlide(pptx, campaignData);
      onProgress?.(10);
    }
    
    // Create completion rate slide
    if (config.includeCompletionRate !== false) {
      createCompletionSlide(pptx, campaignData);
      onProgress?.(20);
    }
    
    // Create response trends slide
    if (config.includeResponseTrends !== false) {
      await createTrendsSlide(pptx, campaignData, instanceId);
      onProgress?.(30);
    }
    
    // Generate the PPTX file
    const buffer = await pptx.write({ outputType: "nodebuffer" });
    return buffer;
    
  } catch (error) {
    console.error("Error generating PPTX:", error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST'
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: corsHeaders
    });
  }

  try {
    const requestData = await req.json();
    const { campaignId, instanceId, config, fileName } = requestData;

    if (!campaignId) {
      return new Response('Missing campaignId parameter', {
        status: 400,
        headers: corsHeaders
      });
    }

    const buffer = await generatePptx(campaignId, instanceId, config);

    return new Response(buffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${fileName || 'survey_presentation.pptx'}"`,
      }
    });
  } catch (error) {
    console.error('Error generating PPTX:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});

