
import React from 'react';
import { User } from 'lucide-react';
import { useOwnerInfo } from '@/components/okr/key-results/hooks/useOwnerInfo';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ObjectiveNodeOwnerInfoProps {
  ownerId: string | undefined;
}

export const ObjectiveNodeOwnerInfo: React.FC<ObjectiveNodeOwnerInfoProps> = ({ 
  ownerId 
}) => {
  const { ownerName } = useOwnerInfo(ownerId || '');
  
  if (!ownerName) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center text-muted-foreground gap-1">
            <User className="h-3 w-3" />
            <span className="truncate max-w-[120px]">{ownerName}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Owner: {ownerName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
