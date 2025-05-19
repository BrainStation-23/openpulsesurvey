
import React from 'react';
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
import { Skeleton } from "@/components/ui/skeleton";

interface Campaign {
  id: string;
  name: string;
}

interface CampaignSelectorProps {
  campaigns: Campaign[];
  selectedCampaignId: string | undefined;
  onSelectCampaign: (campaignId: string) => void;
  isLoading?: boolean;
}

export function CampaignSelector({
  campaigns,
  selectedCampaignId,
  onSelectCampaign,
  isLoading = false,
}: CampaignSelectorProps) {
  const [open, setOpen] = React.useState(false);

  if (isLoading) {
    return <Skeleton className="h-10 w-[250px]" />;
  }

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between"
        >
          {selectedCampaign ? selectedCampaign.name : "Select campaign..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search campaign..." className="h-9" />
          <CommandEmpty>No campaign found.</CommandEmpty>
          <CommandGroup>
            {campaigns.map((campaign) => (
              <CommandItem
                key={campaign.id}
                value={campaign.id}
                onSelect={(currentValue) => {
                  onSelectCampaign(currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCampaignId === campaign.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {campaign.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
