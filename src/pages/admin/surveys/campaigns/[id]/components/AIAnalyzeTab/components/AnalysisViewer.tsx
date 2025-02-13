
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
        <ScrollArea className="h-[500px] w-full pr-4">
          <div 
            className="prose prose-slate max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ 
              __html: content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                           .replace(/\*(.*?)\*/g, '<li>$1</li>')
                           .replace(/<br><br>/g, '</p><p>')
                           .replace(/<br>/g, '<br/>')
            }}
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
