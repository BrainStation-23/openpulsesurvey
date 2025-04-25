
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import PptxGenJS from "https://esm.sh/pptxgenjs@3.12.0";
import { corsHeaders, createErrorResponse, validateCampaignId } from "./utils/helpers.ts";
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
  console.log(`Starting PPTX generation for campaign ${campaignId}, instance ${instanceId || 'none'}`);
  
  // Initialize presentation
  const pptx = new PptxGenJS();
  pptx.author = config.author || "Survey System";
  pptx.company = config.company || "Your Company";
  
  try {
    // Fetch campaign data
    console.log("Fetching campaign data...");
    const campaignData = await fetchCampaignData(campaignId, instanceId);
    if (!campaignData) {
      throw new Error("Failed to fetch campaign data");
    }
    
    console.log(`Campaign data fetched successfully for '${campaignData.name}'`);
    
    // Use campaign name for title if not explicitly set
    pptx.title = config.fileName || campaignData.name;
    
    // Create title slide
    if (config.includeTitle !== false) {
      console.log("Creating title slide...");
      await createTitleSlide(pptx, campaignData);
      onProgress?.(10);
    }
    
    // Create completion rate slide
    if (config.includeCompletionRate !== false) {
      console.log("Creating completion rate slide...");
      createCompletionSlide(pptx, campaignData);
      onProgress?.(20);
    }
    
    // Create response trends slide
    if (config.includeResponseTrends !== false) {
      try {
        console.log("Creating trends slide...");
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
        console.log("Creating question slides...");
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
    
    // Parse and validate request data
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error("Error parsing request JSON:", error);
      return createErrorResponse("Invalid request format: Unable to parse JSON", 400);
    }
    
    console.log("Request data parsed:", JSON.stringify(requestData));
    
    const { campaignId, instanceId, config, fileName } = requestData;

    // Validate required parameters
    if (!campaignId) {
      return createErrorResponse("Missing required parameter: campaignId", 400);
    }

    console.log(`Processing request for campaign ${campaignId}, instance ${instanceId || 'none'}`);
    
    // Generate PPTX
    try {
      const buffer = await generatePptx(campaignId, instanceId, config);
      console.log("PPTX generated successfully, preparing response");

      // Return binary data as Uint8Array for proper handling
      return new Response(buffer, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'Content-Disposition': `attachment; filename="${fileName || 'survey_presentation.pptx'}"`,
          'Content-Length': buffer.byteLength.toString()
        }
      });
    } catch (error) {
      console.error("Error during PPTX generation:", error);
      return createErrorResponse(`PPTX generation failed: ${error.message || String(error)}`, 500);
    }
  } catch (error) {
    console.error('Unhandled error:', error);
    return createErrorResponse(`Unhandled error: ${error.message || String(error)}`, 500);
  }
});
