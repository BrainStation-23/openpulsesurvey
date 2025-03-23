
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Objective } from '@/types/okr';
import { useObjectives } from '@/hooks/okr/useObjectives';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ObjectiveSearchInputProps {
  currentObjectiveId: string;
  onSelect: (objective: Objective) => void;
  placeholder?: string;
  className?: string;
}

export const ObjectiveSearchInput = ({
  currentObjectiveId,
  onSelect,
  placeholder = 'Search objectives...',
  className
}: ObjectiveSearchInputProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { objectives, isLoading } = useObjectives();
  const [filteredObjectives, setFilteredObjectives] = useState<Objective[]>([]);
  
  // Filter objectives to prevent cyclic relationships and self-selection
  useEffect(() => {
    if (!objectives) return;
    
    // Get all objectives except:
    // 1. The current objective itself
    // 2. Objectives that already have this objective as parent
    // 3. Child objectives of the current objective (to prevent cycles)
    const childIdsToExclude = new Set<string>();
    
    // Helper function to recursively collect all child IDs
    const collectChildIds = (parentId: string) => {
      const children = objectives.filter(obj => obj.parentObjectiveId === parentId);
      children.forEach(child => {
        childIdsToExclude.add(child.id);
        collectChildIds(child.id);
      });
    };
    
    // Start collecting child IDs from the current objective
    collectChildIds(currentObjectiveId);
    
    // Filter objectives
    const filtered = objectives.filter(obj => {
      // Exclude self
      if (obj.id === currentObjectiveId) return false;
      
      // Exclude already child objectives (to prevent cycles)
      if (childIdsToExclude.has(obj.id)) return false;
      
      // Apply search query
      if (searchQuery) {
        return obj.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      return true;
    });
    
    setFilteredObjectives(filtered);
  }, [objectives, currentObjectiveId, searchQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-70" />
            <CommandInput 
              placeholder={placeholder} 
              onValueChange={setSearchQuery}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          {isLoading ? (
            <div className="py-6 text-center">
              <LoadingSpinner className="mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">Loading objectives...</p>
            </div>
          ) : (
            <>
              <CommandEmpty>No objectives found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-72">
                  {filteredObjectives.map((objective) => (
                    <CommandItem
                      key={objective.id}
                      value={objective.id}
                      onSelect={() => {
                        onSelect(objective);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className="mr-2 h-4 w-4 opacity-0"
                      />
                      <div className="flex flex-col">
                        <span>{objective.title}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                          {objective.description || 'No description'}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};
