
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { QuestionType } from '@/types/survey-builder';
import { Star, Check, Type, AlignLeft } from 'lucide-react';

interface ToolboxPanelProps {
  onAddQuestion: (type: QuestionType) => void;
}

export const ToolboxPanel: React.FC<ToolboxPanelProps> = ({ onAddQuestion }) => {
  const questionTypes = [
    { type: 'rating' as const, name: 'Rating', icon: <Star className="h-4 w-4" /> },
    { type: 'boolean' as const, name: 'Boolean', icon: <Check className="h-4 w-4" /> },
    { type: 'text' as const, name: 'Text', icon: <Type className="h-4 w-4" /> },
    { type: 'comment' as const, name: 'Comment', icon: <AlignLeft className="h-4 w-4" /> }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          {questionTypes.map((item) => (
            <Button 
              key={item.type}
              variant="outline"
              className="justify-start"
              onClick={() => onAddQuestion(item.type)}
            >
              <span className="mr-2">{item.icon}</span>
              {item.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
