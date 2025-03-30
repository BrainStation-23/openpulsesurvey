
import React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { ObjectiveStatus, ObjectiveVisibilityCategory } from '@/hooks/okr/useObjectivesByVisibility';
import { OKRCycle } from '@/types/okr';

export type ObjectivesFilter = {
  search: string;
  status: string[];
  visibility: ObjectiveVisibilityCategory;
  cycleId?: string;
  sbuId?: string;
};

interface ObjectivesFilterPanelProps {
  filters: ObjectivesFilter;
  onFilterChange: (filters: ObjectivesFilter) => void;
  cycles: OKRCycle[];
  sbus: { id: string; name: string }[];
  cyclesLoading?: boolean;
  sbusLoading?: boolean;
}

export const ObjectivesFilterPanel: React.FC<ObjectivesFilterPanelProps> = ({
  filters,
  onFilterChange,
  cycles,
  sbus,
  cyclesLoading = false,
  sbusLoading = false,
}) => {
  const statusOptions: { label: string; value: ObjectiveStatus }[] = [
    { label: 'Draft', value: 'draft' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'At Risk', value: 'at_risk' },
    { label: 'On Track', value: 'on_track' },
    { label: 'Completed', value: 'completed' },
  ];

  const visibilityOptions = [
    { label: 'All', value: 'all' as ObjectiveVisibilityCategory },
    { label: 'Organization', value: 'organization' as ObjectiveVisibilityCategory },
    { label: 'Department', value: 'department' as ObjectiveVisibilityCategory },
    { label: 'Team', value: 'team' as ObjectiveVisibilityCategory },
    { label: 'Private', value: 'private' as ObjectiveVisibilityCategory },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (status: ObjectiveStatus) => {
    const newStatuses = [...filters.status];
    if (newStatuses.includes(status)) {
      onFilterChange({
        ...filters,
        status: newStatuses.filter((s) => s !== status),
      });
    } else {
      onFilterChange({
        ...filters,
        status: [...newStatuses, status],
      });
    }
  };

  const handleVisibilityChange = (visibility: ObjectiveVisibilityCategory) => {
    onFilterChange({ ...filters, visibility });
  };

  const handleCycleChange = (cycleId: string) => {
    onFilterChange({ ...filters, cycleId });
  };

  const handleSbuChange = (sbuId: string) => {
    onFilterChange({ ...filters, sbuId });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      status: [],
      visibility: 'all',
      cycleId: undefined,
      sbuId: undefined,
    });
  };

  const hasActiveFilters = 
    filters.search !== '' || 
    filters.status.length > 0 || 
    filters.visibility !== 'all' || 
    filters.cycleId !== undefined ||
    filters.sbuId !== undefined;

  return (
    <div className="space-y-4 p-4 bg-background border rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="text-xs text-muted-foreground flex items-center hover:text-primary transition-colors"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all filters
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="search" className="text-sm font-medium">Search</Label>
          <Input
            id="search"
            placeholder="Search objectives..."
            value={filters.search}
            onChange={handleSearchChange}
            className="mt-1"
          />
        </div>

        <Separator />

        <Accordion type="multiple" defaultValue={['status', 'visibility', 'cycle']}>
          <AccordionItem value="status">
            <AccordionTrigger className="text-sm font-medium py-2">Status</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={filters.status.includes(option.value)}
                      onCheckedChange={() => handleStatusChange(option.value)}
                    />
                    <Label htmlFor={`status-${option.value}`} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="visibility">
            <AccordionTrigger className="text-sm font-medium py-2">Visibility</AccordionTrigger>
            <AccordionContent>
              <Select value={filters.visibility} onValueChange={handleVisibilityChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {visibilityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cycle">
            <AccordionTrigger className="text-sm font-medium py-2">OKR Cycle</AccordionTrigger>
            <AccordionContent>
              <Select 
                value={filters.cycleId || ''} 
                onValueChange={handleCycleChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select OKR cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="">All cycles</SelectItem>
                    {cycles.map((cycle) => (
                      <SelectItem key={cycle.id} value={cycle.id}>
                        {cycle.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>

          {filters.visibility === 'department' && (
            <AccordionItem value="sbu">
              <AccordionTrigger className="text-sm font-medium py-2">Department (SBU)</AccordionTrigger>
              <AccordionContent>
                <Select 
                  value={filters.sbuId || ''} 
                  onValueChange={handleSbuChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="">All departments</SelectItem>
                      {sbus.map((sbu) => (
                        <SelectItem key={sbu.id} value={sbu.id}>
                          {sbu.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>

      {hasActiveFilters && (
        <div className="pt-2 flex flex-wrap gap-1">
          {filters.search && (
            <Badge variant="outline" className="bg-muted/50">
              Search: {filters.search}
              <button 
                className="ml-1 hover:text-destructive" 
                onClick={() => onFilterChange({ ...filters, search: '' })}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.status.map((status) => (
            <Badge key={status} variant="outline" className="bg-muted/50">
              Status: {status.replace('_', ' ')}
              <button 
                className="ml-1 hover:text-destructive" 
                onClick={() => handleStatusChange(status as ObjectiveStatus)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {filters.visibility !== 'all' && (
            <Badge variant="outline" className="bg-muted/50">
              Visibility: {filters.visibility}
              <button 
                className="ml-1 hover:text-destructive" 
                onClick={() => onFilterChange({ ...filters, visibility: 'all' })}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.cycleId && cycles.find(c => c.id === filters.cycleId) && (
            <Badge variant="outline" className="bg-muted/50">
              Cycle: {cycles.find(c => c.id === filters.cycleId)?.name}
              <button 
                className="ml-1 hover:text-destructive" 
                onClick={() => onFilterChange({ ...filters, cycleId: undefined })}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.sbuId && sbus.find(s => s.id === filters.sbuId) && (
            <Badge variant="outline" className="bg-muted/50">
              Department: {sbus.find(s => s.id === filters.sbuId)?.name}
              <button 
                className="ml-1 hover:text-destructive" 
                onClick={() => onFilterChange({ ...filters, sbuId: undefined })}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
