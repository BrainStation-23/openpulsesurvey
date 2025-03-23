
import React from 'react';
import { User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  const { data: ownerInfo } = useQuery({
    queryKey: ['user', ownerId],
    queryFn: async () => {
      if (!ownerId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', ownerId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!ownerId
  });
  
  const ownerName = ownerInfo 
    ? `${ownerInfo.first_name || ''} ${ownerInfo.last_name || ''}`.trim() 
    : '';

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
