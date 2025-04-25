
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

export function cleanText(text: any): string {
  if (typeof text !== 'string') {
    return String(text || '');
  }
  return text
    .replace(/[^\w\s.,!?-]/g, ' ')  // Replace special chars with space
    .replace(/\s+/g, ' ')           // Collapse multiple spaces
    .trim();
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    console.error(`Error formatting date ${dateString}:`, error);
    return 'Invalid Date';
  }
}

export function logError(context: string, error: any): void {
  console.error(`Error in ${context}: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
  if (error instanceof Error && error.stack) {
    console.error(`Stack trace: ${error.stack}`);
  }
}

export function safelyExecute<T>(
  operation: () => Promise<T>,
  context: string,
  fallback: T
): Promise<T> {
  return operation().catch(error => {
    logError(context, error);
    return fallback;
  });
}

export function validateCampaignId(campaignId: string | null | undefined): string {
  if (!campaignId) {
    throw new Error("Missing or invalid campaignId");
  }
  return campaignId;
}

export function createErrorResponse(error: any, status = 500) {
  return new Response(
    JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
      status: 'error'
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}
