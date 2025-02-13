
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

interface AnalysisViewerProps {
  content: string;
  isLoading: boolean;
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

  return (
    <Card>
      <CardContent className="p-6">
        <div className="prose prose-slate max-w-none dark:prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
