
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { usePptxExport } from "../hooks/usePptxExport";
import { ArrowDown } from "lucide-react";
import { SharePresentationModal } from "./SharePresentationModal";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import { CampaignData } from "../types";

interface PresentationActionsDropdownProps {
  campaign: {
    id: string;
    name: string;
    instance?: { id: string };
  };
}

export function PresentationActionsDropdown({ campaign }: PresentationActionsDropdownProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const { handleExport, exporting, progress } = usePptxExport();

  // For processedData: we need to call usePresentationResponses, but it's designed for the presentation view.
  // Here, we gracefully skip the progress bar & toasts if not present.
  const [processedData, setProcessedData] = useState<any>(null);
  const [loadingProcessedData, setLoadingProcessedData] = useState(false);

  // Fetch processedData only when user clicks Download PPTX if we don't have it yet
  const fetchProcessedDataIfNeeded = async () => {
    if (processedData) return processedData;
    setLoadingProcessedData(true);
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/processed-data${campaign.instance?.id ? `?instance=${campaign.instance.id}` : ""}`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch campaign data");
      const data = await response.json();
      setProcessedData(data);
      return data;
    } catch {
      return null;
    } finally {
      setLoadingProcessedData(false);
    }
  };

  const handleDownloadPptxWithFetch = async () => {
    // Lazy-load processedData if not already
    let data = processedData;
    if (!data) {
      data = await fetchProcessedDataIfNeeded();
    }
    // Create a minimal CampaignData object with the required properties
    const campaignData: CampaignData = {
      id: campaign.id,
      name: campaign.name,
      description: "", // Provide default values for required properties
      starts_at: new Date().toISOString(),
      ends_at: null,
      completion_rate: 0,
      survey: {
        id: "",
        name: "",
        description: null,
        json_data: { pages: [] }
      },
      instance: campaign.instance ? {
        id: campaign.instance.id,
        period_number: 1,
        starts_at: new Date().toISOString(),
        ends_at: new Date().toISOString(),
        status: "active",
        completion_rate: 0
      } : undefined
    };
    
    // use handleExport from the hook for user feedback
    handleExport(campaignData, data);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="ml-1"
            aria-label="Presentation actions"
          >
            <ArrowDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="z-[100] bg-background">
          <DropdownMenuItem onClick={() => setShareOpen(true)}>
            Share public link
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={exporting || loadingProcessedData}
            onClick={handleDownloadPptxWithFetch}
          >
            {exporting || loadingProcessedData ? (
              <div className="w-full">
                <div className="flex items-center mb-2">
                  <Spinner className="h-4 w-4 mr-2" />
                  {loadingProcessedData ? "Loading data..." : "Downloading..."}
                </div>
                {exporting && (
                  <Progress 
                    value={progress} 
                    className="h-1.5" 
                    indicatorClassName="bg-primary"
                  />
                )}
              </div>
            ) : (
              "Download PPTX"
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Modal for Share Presentation */}
      <SharePresentationModal
        campaignId={campaign.id}
        instanceId={campaign.instance?.id}
        key={shareOpen ? "open" : "closed"}
        // Show if open, otherwise unmount
        {...(shareOpen
          ? {
              // Radix dialog expects open/onOpenChange
              isOpen: true,
              onOpenChange: (open: boolean) => setShareOpen(open)
            }
          : { isOpen: false, onOpenChange: (open: boolean) => setShareOpen(open) })}
      />
    </>
  );
}
