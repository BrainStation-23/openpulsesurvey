
import type { GeneratedEmail } from "../types";

/**
 * Parses email strings in the format "Name <email@domain.com>" into separate name and email
 */
export function parseEmailString(emailStr: string): { name: string; email: string } {
  try {
    const matches = emailStr.match(/^(.*?)\s*<(.+?)>$/);
    if (matches) {
      return {
        name: matches[1].trim(),
        email: matches[2].trim()
      };
    }
    // Fallback if format doesn't match
    return {
      name: emailStr,
      email: emailStr
    };
  } catch (error) {
    console.error('Error parsing email string:', error);
    return {
      name: 'Unknown Sender',
      email: 'unknown@example.com'
    };
  }
}

export function transformEmailResponse(data: any): GeneratedEmail {
  try {
    return {
      from: typeof data.from === 'string' 
        ? parseEmailString(data.from)
        : data.from,
      subject: data.subject || 'No Subject',
      content: data.content || '',
      key_points: Array.isArray(data.key_points) ? data.key_points : [],
      tone: data.tone || 'neutral'
    };
  } catch (error) {
    console.error('Error transforming email response:', error);
    throw new Error('Failed to transform email data');
  }
}
