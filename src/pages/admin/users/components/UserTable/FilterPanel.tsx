
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  selectedSBU: string;
  selectedLevel: string;
  selectedLocation: string;
  selectedEmploymentType: string;
  selectedEmployeeRole: string;
  selectedEmployeeType: string;
  setSelectedSBU: (value: string) => void;
  setSelectedLevel: (value: string) => void;
  setSelectedLocation: (value: string) => void;
  setSelectedEmploymentType: (value: string) => void;
  setSelectedEmployeeRole: (value: string) => void;
  setSelectedEmployeeType: (value: string) => void;
  addFilter: (key: string, value: string) => void;
  sbus: Array<{ id: string; name: string }>;
  levels: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  employmentTypes: Array<{ id: string; name: string }>;
  employeeRoles: Array<{ id: string; name: string }>;
  employeeTypes: Array<{ id: string; name: string }>;
}

export function FilterPanel({
  selectedSBU,
  selectedLevel,
  selectedLocation,
  selectedEmploymentType,
  selectedEmployeeRole,
  selectedEmployeeType,
  setSelectedSBU,
  setSelectedLevel,
  setSelectedLocation,
  setSelectedEmploymentType,
  setSelectedEmployeeRole,
  setSelectedEmployeeType,
  addFilter,
  sbus,
  levels,
  locations,
  employmentTypes,
  employeeRoles,
  employeeTypes,
}: FilterPanelProps) {
  const hasActiveFilters = [
    selectedSBU,
    selectedLevel,
    selectedLocation,
    selectedEmploymentType,
    selectedEmployeeRole,
    selectedEmployeeType
  ].some(filter => filter !== 'all');

  const clearAllFilters = () => {
    setSelectedSBU('all');
    setSelectedLevel('all');
    setSelectedLocation('all');
    setSelectedEmploymentType('all');
    setSelectedEmployeeRole('all');
    setSelectedEmployeeType('all');
  };

  return (
    <div className="space-y-4 bg-background rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault(); // Prevent form submission
              clearAllFilters();
            }}
            className="text-muted-foreground hover:text-foreground"
            type="button" // Add explicit type="button" to prevent form submission
          >
            <X className="mr-2 h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Primary Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Select value={selectedSBU} onValueChange={setSelectedSBU}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by SBU" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All SBUs</SelectItem>
                {sbus.map((sbu) => (
                  <SelectItem key={sbu.id} value={sbu.id}>
                    {sbu.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Employee Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Select value={selectedEmploymentType} onValueChange={setSelectedEmploymentType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Employment Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employment Types</SelectItem>
                {employmentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEmployeeRole} onValueChange={setSelectedEmployeeRole}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Employee Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employee Roles</SelectItem>
                {employeeRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedEmployeeType} onValueChange={setSelectedEmployeeType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Employee Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employee Types</SelectItem>
                {employeeTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault(); // Prevent form submission
              addFilter('status', 'active');
            }}
            type="button" // Add explicit type="button" to prevent form submission
          >
            Active Users
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault(); // Prevent form submission
              addFilter('role', 'admin');
            }}
            type="button" // Add explicit type="button" to prevent form submission
          >
            Admins
          </Button>
        </div>
      </div>
    </div>
  );
}
