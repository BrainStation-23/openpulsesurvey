
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import PptxGenJS from "https://esm.sh/pptxgenjs@3.12.0";
import { corsHeaders } from "./utils/helpers.ts";
import { 
  createTitleSlide, 
  createCompletionSlide, 
  createTrendsSlide,
  createQuestionSlidesForPPTX 
} from "./utils/slides.ts";
import { fetchCampaignData } from "./utils/fetchResponses.ts";

interface ExportConfig {
  dimensions?: string[];
  theme?: any;
  includeTitle?: boolean;
  includeCompletionRate?: boolean;
  includeResponseTrends?: boolean;
  includeQuestionSlides?: boolean;
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
      try {
        await createTrendsSlide(pptx, campaignData, instanceId);
      } catch (error) {
        console.error("Error creating trends slide:", error);
        // Continue without this slide - don't fail the whole presentation
      }
      onProgress?.(30);
    }
    
    // Create question-specific slides
    if (config.includeQuestionSlides !== false) {
      try {
        await createQuestionSlidesForPPTX(pptx, campaignData, instanceId);
      } catch (error) {
        console.error("Error creating question slides:", error);
        // Continue without these slides - don't fail the whole presentation
      }
      onProgress?.(80);
    }
    
    // Generate the PPTX file
    console.log("Generating final PPTX buffer...");
    const buffer = await pptx.write({ outputType: "nodebuffer" });
    onProgress?.(100);
    console.log(`PPTX generation complete, buffer size: ${buffer.byteLength} bytes`);
    return buffer;
    
  } catch (error) {
    console.error("Error generating PPTX:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS
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
    console.log("Received PPTX export request");
    const requestData = await req.json();
    const { campaignId, instanceId, config, fileName } = requestData;

    if (!campaignId) {
      return new Response('Missing campaignId parameter', {
        status: 400,
        headers: corsHeaders
      });
    }

    console.log(`Processing request for campaign ${campaignId}, instance ${instanceId || 'none'}`);
    const buffer = await generatePptx(campaignId, instanceId, config);
    console.log("PPTX generated successfully, preparing response");

    // Return binary data directly
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
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
