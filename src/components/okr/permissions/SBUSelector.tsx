
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface SBUSelectorProps {
  selectedSBUs: string[];
  onChange: (sbus: string[]) => void;
  placeholder?: string;
}

interface SBU {
  id: string;
  name: string;
}

export const SBUSelector = ({ selectedSBUs, onChange, placeholder = "Select business units..." }: SBUSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: sbus, isLoading } = useQuery({
    queryKey: ['sbus', searchQuery],
    queryFn: async () => {
      const query = supabase
        .from('sbus')
        .select('id, name')
        .order('name', { ascending: true });
        
      if (searchQuery) {
        query.ilike('name', `%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as SBU[];
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  const { data: selectedSBUDetails } = useQuery({
    queryKey: ['sbuDetails', selectedSBUs],
    queryFn: async () => {
      if (!selectedSBUs.length) return [];
      
      const { data, error } = await supabase
        .from('sbus')
        .select('id, name')
        .in('id', selectedSBUs);
        
      if (error) throw error;
      return data as SBU[];
    },
    enabled: selectedSBUs.length > 0
  });
  
  const handleSelectSBU = (sbuId: string) => {
    if (selectedSBUs.includes(sbuId)) {
      onChange(selectedSBUs.filter(id => id !== sbuId));
    } else {
      onChange([...selectedSBUs, sbuId]);
    }
  };
  
  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedSBUs.length 
              ? `${selectedSBUs.length} business unit${selectedSBUs.length > 1 ? 's' : ''} selected` 
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search business units..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading business units...
              </div>
            ) : (
              <>
                <CommandEmpty>No business units found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-72">
                    {sbus?.map((sbu) => (
                      <CommandItem
                        key={sbu.id}
                        value={sbu.id}
                        onSelect={() => handleSelectSBU(sbu.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedSBUs.includes(sbu.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {sbu.name}
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Show selected SBUs as badges */}
      {selectedSBUDetails && selectedSBUDetails.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedSBUDetails.map(sbu => (
            <Badge 
              key={sbu.id} 
              variant="secondary"
              className="flex items-center gap-1"
            >
              {sbu.name}
              <button 
                className="ml-1 rounded-full hover:bg-muted p-0.5" 
                onClick={() => handleSelectSBU(sbu.id)}
              >
                <span className="sr-only">Remove</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
