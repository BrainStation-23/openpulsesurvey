
import React from 'react';
import { Lightbulb } from 'lucide-react';

interface QuestionInsightProps {
  avgValue: number | null;
  questionType?: 'rating' | 'boolean';
}

export function QuestionInsight({ avgValue, questionType = 'rating' }: QuestionInsightProps) {
  if (avgValue === null) return null;
  
  let insightText = '';
  
  if (questionType === 'boolean') {
    // For boolean questions, the average is the percentage of "Yes" responses
    const yesPercentage = avgValue * 100;
    if (yesPercentage >= 75) {
      insightText = "Strong positive consensus. Most team members agree on this matter.";
    } else if (yesPercentage >= 50) {
      insightText = "Moderate positive consensus. A majority of team members agree, but there's room for improvement.";
    } else if (yesPercentage >= 25) {
      insightText = "Divided opinions with a negative tendency. Consider addressing this area.";
    } else {
      insightText = "Strong negative consensus. This area needs immediate attention.";
    }
  } else {
    // For rating questions
    if (avgValue >= 4) {
      insightText = "This rating is positive. Team members seem satisfied in this area.";
    } else if (avgValue >= 3) {
      insightText = "This rating is neutral. Consider exploring ways to improve this area.";
    } else {
      insightText = "This rating needs attention. Consider addressing this area promptly.";
    }
  }
  
  return (
    <div className="flex items-start p-2 bg-amber-50/50 rounded-md">
      <Lightbulb className="h-5 w-5 mr-3 text-amber-500 mt-0.5 flex-shrink-0" />
      <p className="text-sm text-slate-700">
        {insightText}
      </p>
    </div>
  );
}
