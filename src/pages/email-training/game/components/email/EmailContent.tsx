
import { Card } from "@/components/ui/card";
import type { GeneratedEmail } from "../../types";
import ReactMarkdown from "react-markdown";

interface EmailContentProps {
  email: GeneratedEmail;
}

function sanitizeEmailContent(text: string): string {
  // Base sanitization
  let sanitized = text.replace(/<br><br>/g, '\n\n');
  sanitized = sanitized.replace(/<br>/g, '\n');
  sanitized = sanitized.replace(/\n\*/g, '\n\n*');
  
  // Email-specific sanitization
  sanitized = sanitized.replace(/<blockquote>(.*?)<\/blockquote>/gs, '> $1\n');  // Email quotes
  sanitized = sanitized.replace(/_{3,}/g, '---');  // Email signatures
  sanitized = sanitized.replace(/([^\n])\n([^\n])/g, '$1\n\n$2');  // Fix single line breaks
  
  // Clean up any remaining HTML tags
  sanitized = sanitized.replace(/<[^>]+>/g, '');
  
  return sanitized;
}

export function EmailContent({ email }: EmailContentProps) {
  const sanitizedContent = sanitizeEmailContent(email.content);

  return (
    <div className="space-y-6">
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown className="whitespace-pre-wrap text-base leading-relaxed">
          {sanitizedContent}
        </ReactMarkdown>
      </div>
      {email.key_points && (
        <Card className="p-4 bg-muted/50">
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Key Points:</h4>
          <ul className="list-disc pl-4 space-y-1">
            {email.key_points.map((point, index) => (
              <li key={index} className="text-sm text-muted-foreground">{point}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
