
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ObjectiveVisibility } from '@/types/okr';

interface ObjectiveVisibilityFilterProps {
  value: ObjectiveVisibility | 'all';
  onChange: (value: ObjectiveVisibility | 'all') => void;
  permissions: any; // Using any for permissions to match existing code
  isLoading: boolean;
}

export const ObjectiveVisibilityFilter: React.FC<ObjectiveVisibilityFilterProps> = ({
  value,
  onChange,
  permissions,
  isLoading
}) => {
  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }
  
  return (
    <RadioGroup
      value={value}
      onValueChange={(val) => onChange(val as ObjectiveVisibility | 'all')}
      className="space-y-2"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="all" id="all" />
        <Label htmlFor="all">All Objectives</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="organization" id="organization" />
        <Label htmlFor="organization">Organization Objectives</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="department" id="department" />
        <Label htmlFor="department">Department Objectives</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="team" id="team" />
        <Label htmlFor="team">Team Objectives</Label>
      </div>
    </RadioGroup>
  );
};
