
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Objective } from '@/types/okr';
import { Check, ChevronDown, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ObjectiveStatusBadge } from '../objectives/ObjectiveStatusBadge';
import { cn } from '@/lib/utils';

interface ObjectiveSearchInputProps {
  onObjectiveSelect: (objective: Objective) => void;
  excludeObjectiveId?: string;
  placeholder?: string;
  buttonClassName?: string;
  searchFilter?: string;
}

export const ObjectiveSearchInput: React.FC<ObjectiveSearchInputProps> = ({
  onObjectiveSelect,
  excludeObjectiveId,
  placeholder = "Search objectives...",
  buttonClassName = "",
  searchFilter
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<Objective[]>([]);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  
  useEffect(() => {
    if (open && searchValue.length > 0) {
      searchObjectives(searchValue);
    }
  }, [open, searchValue]);
  
  const searchObjectives = async (query: string) => {
    try {
      let queryBuilder = supabase
        .from('objectives')
        .select(`
          *,
          profiles:owner_id (
            id,
            first_name,
            last_name
          )
        `)
        .ilike('title', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (excludeObjectiveId) {
        queryBuilder = queryBuilder.neq('id', excludeObjectiveId);
      }
      
      // Add additional filters if needed
      if (searchFilter === 'organization') {
        queryBuilder = queryBuilder.eq('visibility', 'organization');
      } else if (searchFilter === 'department') {
        queryBuilder = queryBuilder.eq('visibility', 'department');
      } else if (searchFilter === 'team') {
        queryBuilder = queryBuilder.eq('visibility', 'team');
      }
      
      const { data, error } = await queryBuilder;
      
      if (error) {
        console.error('Error searching objectives:', error);
        return;
      }
      
      // Transform data to include owner name
      const objectives = data.map(obj => {
        // Make sure we have the owner profile data
        const ownerProfile = obj.profiles || {};
        const ownerName = ownerProfile.first_name && ownerProfile.last_name 
          ? `${ownerProfile.first_name} ${ownerProfile.last_name}`
          : 'Unknown';
          
        // Return objective with additional info
        return {
          ...obj,
          ownerName
        };
      });
      
      setSearchResults(objectives);
    } catch (error) {
      console.error('Error searching objectives:', error);
    }
  };

  const handleObjectiveSelect = (objective: Objective) => {
    setSelectedObjective(objective);
    onObjectiveSelect(objective);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", buttonClassName)}
        >
          {selectedObjective ? selectedObjective.title : placeholder}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[400px]">
        <Command>
          <CommandInput 
            placeholder="Search objectives..." 
            value={searchValue}
            onValueChange={setSearchValue}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No objectives found.</CommandEmpty>
            <CommandGroup>
              {searchResults.map((objective) => (
                <CommandItem
                  key={objective.id}
                  value={objective.id}
                  onSelect={() => handleObjectiveSelect(objective)}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col w-full">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{objective.title}</span>
                      {selectedObjective?.id === objective.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground gap-2">
                      <ObjectiveStatusBadge status={objective.status} className="text-xs h-5" />
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span>{objective.ownerName || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
