
import React from 'react';
import { MessageSquare } from 'lucide-react';

interface TextResponseSummaryProps {
  distribution: any;
}

export function TextResponseSummary({ distribution }: TextResponseSummaryProps) {
  return (
    <div className="mt-4 bg-muted p-4 rounded-md">
      <div className="flex items-center mb-2">
        <MessageSquare className="h-5 w-5 mr-2 text-muted-foreground" />
        <span className="font-medium">Text Responses</span>
      </div>
      {Array.isArray(distribution) && distribution.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          {distribution.length} responses received.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">No text responses available.</p>
      )}
    </div>
  );
}
