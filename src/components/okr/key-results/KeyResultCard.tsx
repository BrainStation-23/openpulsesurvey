
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, AlertTriangle, Clock, Trash2 } from 'lucide-react';
import { KeyResult } from '@/types/okr';
import { KeyResultStatusBadge } from './KeyResultStatusBadge';

interface KeyResultCardProps {
  keyResult: KeyResult;
  onCheckIn: (kr: KeyResult) => void;
  onEdit: (kr: KeyResult) => void;
  onDelete: (kr: KeyResult) => void; // Add delete handler prop
}

export const KeyResultCard = ({ keyResult, onCheckIn, onEdit, onDelete }: KeyResultCardProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'at_risk':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'not_started':
        return <Clock className="h-4 w-4 text-slate-400" />;
      default:
        return null;
    }
  };

  return (
    <div 
      key={keyResult.id} 
      className="border rounded-md p-4 hover:bg-accent/30 transition-colors"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon(keyResult.status)}
          <h3 className="font-medium">{keyResult.title}</h3>
        </div>
        <KeyResultStatusBadge status={keyResult.status} />
      </div>
      
      {keyResult.description && (
        <p className="text-sm text-muted-foreground mb-2">{keyResult.description}</p>
      )}
      
      <div className="mt-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Progress</span>
          <span>{keyResult.progress}%</span>
        </div>
        <Progress 
          value={keyResult.progress} 
          className="h-1.5" 
          indicatorClassName={
            keyResult.progress >= 100 ? "bg-green-500" :
            keyResult.progress >= 75 ? "bg-blue-500" :
            keyResult.progress >= 50 ? "bg-yellow-500" :
            keyResult.progress >= 25 ? "bg-orange-500" :
            "bg-red-500"
          }
        />
      </div>
      
      <div className="flex justify-between items-center mt-4 text-sm">
        <div>
          {keyResult.unit && (
            <span className="text-muted-foreground">
              {keyResult.startValue} → {keyResult.currentValue} → {keyResult.targetValue} {keyResult.unit}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onCheckIn(keyResult)}
          >
            Check-in
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit(keyResult)}
          >
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-100"
            onClick={() => onDelete(keyResult)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
