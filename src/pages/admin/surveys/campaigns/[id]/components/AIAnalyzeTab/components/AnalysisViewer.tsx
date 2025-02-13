
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

interface AnalysisViewerProps {
  content: string;
  isLoading: boolean;
}

function sanitizeMarkdown(text: string): string {
  // Replace double <br><br> with double newlines for paragraph breaks
  let sanitized = text.replace(/<br><br>/g, '\n\n');
  // Replace single <br> with newlines
  sanitized = sanitized.replace(/<br>/g, '\n');
  // Ensure proper spacing for list items
  sanitized = sanitized.replace(/\n\*/g, '\n\n*');
  return sanitized;
}

export function AnalysisViewer({ content, isLoading }: AnalysisViewerProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sanitizedContent = sanitizeMarkdown(content);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="prose prose-slate max-w-none dark:prose-invert">
          <ReactMarkdown>{sanitizedContent}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
