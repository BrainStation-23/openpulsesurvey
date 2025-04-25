
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
}
