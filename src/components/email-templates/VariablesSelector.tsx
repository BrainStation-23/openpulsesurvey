
import { useState } from 'react';
import { X, Check, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';
import { TemplateVariable } from '@/types/emailTemplates';

interface VariablesSelectorProps {
  variables: TemplateVariable[];
  selectedVariables: string[];
  onChange: (variables: string[]) => void;
}

export default function VariablesSelector({ 
  variables, 
  selectedVariables, 
  onChange 
}: VariablesSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (variable: string) => {
    if (selectedVariables.includes(variable)) {
      onChange(selectedVariables.filter(v => v !== variable));
    } else {
      onChange([...selectedVariables, variable]);
    }
  };

  const handleRemove = (variable: string) => {
    onChange(selectedVariables.filter(v => v !== variable));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedVariables.length === 0 ? (
          <div className="text-muted-foreground text-sm py-1">
            No variables selected
          </div>
        ) : (
          selectedVariables.map(variable => (
            <Badge
              key={variable}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {variable}
              <button
                type="button"
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => handleRemove(variable)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                <span className="sr-only">Remove {variable}</span>
              </button>
            </Badge>
          ))
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-full md:w-[250px]"
          >
            <span>Add variables...</span>
            <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full md:w-[250px] p-0">
          <Command>
            <CommandInput placeholder="Search variables..." />
            <CommandList>
              <CommandEmpty>No variables found.</CommandEmpty>
              <CommandGroup>
                {variables.map(variable => (
                  <CommandItem
                    key={variable.id}
                    value={variable.name}
                    onSelect={() => {
                      handleSelect(variable.name);
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span>{variable.name}</span>
                        {variable.description && (
                          <p className="text-xs text-muted-foreground">
                            {variable.description}
                          </p>
                        )}
                      </div>
                      <Check
                        className={cn(
                          "h-4 w-4 opacity-0 transition-opacity",
                          selectedVariables.includes(variable.name) 
                            ? "opacity-100" 
                            : "opacity-0"
                        )}
                      />
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
