
import React, { useState, useEffect } from 'react';
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);

  // Filter campaigns based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCampaigns(campaigns);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredCampaigns(
        campaigns.filter(campaign => 
          campaign.name.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, campaigns]);

  if (isLoading) {
    return (
      <div className="space-y-3 w-full">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>
      
      {filteredCampaigns.length === 0 ? (
        <p className="text-muted-foreground text-sm">No campaigns found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCampaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-md",
                selectedCampaignId === campaign.id 
                  ? "border-2 border-primary bg-primary/5" 
                  : "hover:bg-accent"
              )}
              onClick={() => onSelectCampaign(campaign.id)}
            >
              <p className="font-medium">{campaign.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedCampaignId === campaign.id ? 'Currently selected' : 'Click to select'}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
