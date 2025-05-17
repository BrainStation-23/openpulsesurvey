
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface ViewTextResponsesButtonProps {
  questionTitle: string;
  responsesCount: number;
  onClick: () => void;
}

export function ViewTextResponsesButton({ questionTitle, responsesCount, onClick }: ViewTextResponsesButtonProps) {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="mt-2 w-full"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <MessageSquare className="h-4 w-4 mr-2" />
      View {responsesCount} {responsesCount === 1 ? 'response' : 'responses'}
    </Button>
  );
}
