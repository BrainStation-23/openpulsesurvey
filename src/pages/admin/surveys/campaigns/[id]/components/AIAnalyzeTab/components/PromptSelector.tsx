
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PromptSelectorProps {
  onPromptSelect: (promptData: { id: string, text: string }) => void;
  selectedPromptId?: string;
}

export function PromptSelector({ onPromptSelect, selectedPromptId }: PromptSelectorProps) {
  const [open, setOpen] = useState(false);

  const { data: prompts, isLoading } = useQuery({
    queryKey: ['analysis-prompts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analysis_prompts')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data || []; // Ensure we always return an array, even if empty
    },
  });

  const selectedPrompt = prompts?.find(prompt => prompt.id === selectedPromptId);

  if (isLoading) {
    return (
      <Button variant="outline" className="w-[350px] justify-between" disabled>
        Loading prompts...
      </Button>
    );
  }

  // Ensure prompts is an array
  const availablePrompts = Array.isArray(prompts) ? prompts : [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[350px] justify-between"
        >
          {selectedPrompt ? selectedPrompt.name : "Select an analysis type..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0">
        <Command>
          <CommandInput placeholder="Search analysis types..." />
          <CommandEmpty>No analysis type found.</CommandEmpty>
          <CommandGroup>
            {availablePrompts.map((prompt) => (
              <CommandItem
                key={prompt.id}
                value={prompt.name}
                onSelect={() => {
                  onPromptSelect({ id: prompt.id, text: prompt.prompt_text });
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedPromptId === prompt.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {prompt.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
