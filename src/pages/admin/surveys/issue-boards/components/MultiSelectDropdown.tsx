
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Option {
  id: string;
  name: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  label: string;
}

export function MultiSelectDropdown({
  options,
  value,
  onChange,
  placeholder,
  label,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelectAll = () => {
    onChange(options.map(option => option.id));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleToggleOption = (optionId: string) => {
    const newValue = value.includes(optionId)
      ? value.filter(id => id !== optionId)
      : [...value, optionId];
    onChange(newValue);
  };

  const selectedCount = value.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {selectedCount > 0 && (
          <Badge variant="secondary" className="ml-2">
            {selectedCount} selected
          </Badge>
        )}
      </div>
      <Select open={open} onOpenChange={setOpen}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <div className="p-2 flex items-center justify-between border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                type="button"
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                type="button"
              >
                Clear All
              </Button>
            </div>
            <ScrollArea className="h-[200px]">
              {options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center space-x-2 p-2 hover:bg-accent cursor-pointer"
                  onClick={() => handleToggleOption(option.id)}
                >
                  <Checkbox
                    checked={value.includes(option.id)}
                    onCheckedChange={() => handleToggleOption(option.id)}
                  />
                  <span>{option.name}</span>
                </div>
              ))}
            </ScrollArea>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
