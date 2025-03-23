
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const [searchQuery, setSearchQuery] = useState('');
  const { objectives, isLoading } = useObjectives();
  const [filteredObjectives, setFilteredObjectives] = useState<Objective[]>([]);
  
  // Filter objectives to prevent cyclic relationships and self-selection
  useEffect(() => {
    if (!objectives || !objectives.length) {
      setFilteredObjectives([]);
      return;
    }
    
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
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <div className="border rounded-md">
        {isLoading ? (
          <div className="py-8 text-center">
            <LoadingSpinner className="mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Loading objectives...</p>
          </div>
        ) : filteredObjectives.length > 0 ? (
          <ScrollArea className="h-72">
            <div className="p-2 grid gap-2">
              {filteredObjectives.map((objective) => (
                <ObjectiveCard 
                  key={objective.id} 
                  objective={objective} 
                  onSelect={onSelect}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">No matching objectives found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Extracted this as a separate component for clarity
const ObjectiveCard = ({ objective, onSelect }: { objective: Objective, onSelect: (objective: Objective) => void }) => {
  return (
    <Card className="hover:bg-accent cursor-pointer transition-colors">
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">{objective.title}</h4>
            {objective.description && (
              <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                {objective.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {objective.status.replace('_', ' ')}
            </Badge>
            <Button size="sm" variant="secondary" onClick={() => onSelect(objective)}>
              Select
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
