
import React from 'react';
import { Lightbulb } from 'lucide-react';

interface QuestionInsightProps {
  avgValue: number | null;
}

export function QuestionInsight({ avgValue }: QuestionInsightProps) {
  if (avgValue === null) return null;
  
  return (
    <div className="mt-4 flex items-center">
      <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
      <p className="text-sm text-muted-foreground">
        {avgValue >= 4 
          ? "This rating is positive. Team members seem satisfied in this area."
          : avgValue >= 3 
          ? "This rating is neutral. Consider exploring ways to improve this area."
          : "This rating needs attention. Consider addressing this area promptly."
        }
      </p>
    </div>
  );
}
