
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/use-debounce';
import { ObjectiveVisibilityBadge } from '../objectives/ObjectiveVisibilityBadge';

interface ObjectiveSearchInputProps {
  onObjectiveSelected: (id: string, title: string) => void;
  excludeObjectiveId?: string;
  selectedObjectiveId?: string;
  selectedObjectiveTitle?: string;
  placeholder?: string;
}

interface ObjectiveSearchResult {
  id: string;
  title: string;
  visibility: 'private' | 'team' | 'department' | 'organization';
  owner_name?: string;
}

export const ObjectiveSearchInput: React.FC<ObjectiveSearchInputProps> = ({
  onObjectiveSelected,
  excludeObjectiveId,
  selectedObjectiveId,
  selectedObjectiveTitle,
  placeholder = 'Search for an objective...'
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [results, setResults] = useState<ObjectiveSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState({
    id: selectedObjectiveId || '',
    title: selectedObjectiveTitle || ''
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Search for objectives based on query
  useEffect(() => {
    const searchObjectives = async () => {
      if (!debouncedQuery) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        let query = supabase
          .from('objectives')
          .select(`
            id,
            title,
            visibility,
            owner_id,
            owner:profiles(name)
          `)
          .ilike('title', `%${debouncedQuery}%`)
          .limit(10);

        // Exclude current objective if provided
        if (excludeObjectiveId) {
          query = query.neq('id', excludeObjectiveId);
        }

        const { data, error } = await query;

        if (error) throw error;

        const formattedResults = data.map(obj => ({
          id: obj.id,
          title: obj.title,
          visibility: obj.visibility,
          owner_name: obj.owner?.name || 'Unknown'
        }));

        setResults(formattedResults);
      } catch (error) {
        console.error('Error searching objectives:', error);
      } finally {
        setLoading(false);
      }
    };

    searchObjectives();
  }, [debouncedQuery, excludeObjectiveId]);

  // Handle selection
  const handleSelect = (objective: ObjectiveSearchResult) => {
    setSelected({
      id: objective.id,
      title: objective.title
    });
    onObjectiveSelected(objective.id, objective.title);
    setOpen(false);
  };

  // Clear selection
  const handleClear = () => {
    setSelected({ id: '', title: '' });
    onObjectiveSelected('', '');
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between font-normal"
          >
            {selected.id ? (
              <div className="flex items-center justify-between w-full">
                <span className="truncate">{selected.title}</span>
                <X
                  className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                />
              </div>
            ) : (
              <>
                <span>{placeholder}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search objectives..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="h-9"
              ref={inputRef}
            />
            {loading && (
              <div className="py-6 text-center text-sm">
                <Search className="h-4 w-4 mx-auto mb-2 animate-pulse" />
                Searching...
              </div>
            )}
            <CommandList>
              <CommandEmpty>No objectives found.</CommandEmpty>
              <CommandGroup>
                {results.map((objective) => (
                  <CommandItem
                    key={objective.id}
                    onSelect={() => handleSelect(objective)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span>{objective.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {objective.owner_name || 'Unknown owner'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ObjectiveVisibilityBadge visibility={objective.visibility} />
                      {selected.id === objective.id && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
