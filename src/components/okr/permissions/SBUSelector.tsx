
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, X, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface SBUSelectorProps {
  selectedSBUs: string[];
  onChange: (sbus: string[]) => void;
  placeholder?: string;
}

interface SBU {
  id: string;
  name: string;
}

export const SBUSelector = ({ selectedSBUs, onChange, placeholder = "Search business units..." }: SBUSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  
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
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowResults(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            className="pl-9 pr-4"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowResults(true);
            }}
          />
        </div>
        
        {showResults && (
          <div className="absolute w-full mt-1 bg-card border rounded-md shadow-md z-50">
            <ScrollArea className="h-[200px]">
              {isLoading ? (
                <div className="p-2 space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <>
                  {sbus && sbus.length > 0 ? (
                    sbus.map(sbu => (
                      <div 
                        key={sbu.id}
                        className={`p-2 cursor-pointer hover:bg-accent flex items-center justify-between ${
                          selectedSBUs.includes(sbu.id) ? 'bg-secondary/50' : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectSBU(sbu.id);
                        }}
                      >
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{sbu.name}</span>
                        </div>
                        {selectedSBUs.includes(sbu.id) && (
                          <div className="text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      {searchQuery.trim() ? 'No business units found' : 'Type to search business units'}
                    </div>
                  )}
                </>
              )}
            </ScrollArea>
          </div>
        )}
      </div>
      
      {/* Selected SBUs badges */}
      {selectedSBUDetails && selectedSBUDetails.length > 0 && (
        <div className="flex flex-wrap gap-1.5 py-2">
          {selectedSBUDetails.map(sbu => (
            <Badge 
              key={sbu.id} 
              variant="secondary"
              className="flex items-center gap-1 py-1.5 px-2"
            >
              <span>{sbu.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-secondary"
                onClick={() => handleSelectSBU(sbu.id)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
