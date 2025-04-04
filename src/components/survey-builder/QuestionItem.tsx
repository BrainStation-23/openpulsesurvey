
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { Question } from '@/types/survey-builder';
import { Badge } from '@/components/ui/badge';
import { Star, Check, Type, AlignLeft } from 'lucide-react';

interface QuestionItemProps {
  question: Question;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  isSelected,
  onSelect,
  onDelete
}) => {
  const getIcon = () => {
    switch (question.type) {
      case 'rating':
        return <Star className="h-4 w-4" />;
      case 'boolean':
        return <Check className="h-4 w-4" />;
      case 'text':
        return <Type className="h-4 w-4" />;
      case 'comment':
        return <AlignLeft className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const typeLabel = question.type.charAt(0).toUpperCase() + question.type.slice(1);

  return (
    <Card 
      className={`mb-4 ${isSelected ? 'border-primary border-2' : ''} cursor-pointer`}
      onClick={() => onSelect(question.id)}
    >
      <CardHeader className="flex flex-row items-center justify-between py-2 px-4">
        <div className="flex items-center">
          <Badge variant="outline" className="mr-2">
            <span className="mr-1">{getIcon()}</span>
            {typeLabel}
          </Badge>
          {question.isRequired && <Badge className="bg-red-500">Required</Badge>}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(question.id);
          }}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="py-2 px-4">
        <div className="font-medium">{question.title}</div>
        {question.description && (
          <div className="text-sm text-muted-foreground">{question.description}</div>
        )}
      </CardContent>
    </Card>
  );
};
