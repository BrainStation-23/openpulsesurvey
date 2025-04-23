
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { usePptxExport } from "../hooks/usePptxExport";
import { ArrowDown } from "lucide-react";
import { SharePresentationModal } from "./SharePresentationModal";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import { CampaignData } from "../types";

// Helper: fetch campaign+survey+instance fully shaped for PPTX export
async function fetchFullCampaignData(campaignId: string, instanceId?: string): Promise<CampaignData | null> {
  try {
    const response = await fetch(`/api/campaigns/${campaignId}/full-data${instanceId ? `?instance=${instanceId}` : ""}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch campaign data");
    const data = await response.json();

    // Should match CampaignData type: (fallbacks kept for safety)
    return {
      id: data.id,
      name: data.name,
      description: data.description ?? "",
      starts_at: data.starts_at ?? new Date().toISOString(),
      ends_at: data.ends_at ?? null,
      completion_rate: data.completion_rate ?? 0,
      survey: data.survey
        ? {
            id: data.survey.id ?? "",
            name: data.survey.name ?? "",
            description: data.survey.description ?? null,
            json_data: data.survey.json_data ?? { pages: [] }
          }
        : {
            id: "",
            name: "",
            description: null,
            json_data: { pages: [] }
          },
      instance: data.instance
        ? {
            id: data.instance.id ?? "",
            period_number: data.instance.period_number ?? 1,
            starts_at: data.instance.starts_at ?? new Date().toISOString(),
            ends_at: data.instance.ends_at ?? new Date().toISOString(),
            status: data.instance.status ?? "active",
            completion_rate: data.instance.completion_rate ?? 0
          }
        : undefined
    };
  } catch (error) {
    console.error("Error in fetchFullCampaignData:", error);
    return null;
  }
}

// Helper: fetch processed responses data in "presentation" style
async function fetchProcessedPresentationData(campaignId: string, instanceId?: string) {
  try {
    const response = await fetch(`/api/campaigns/${campaignId}/processed-data${instanceId ? `?instance=${instanceId}` : ""}`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch campaign results");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching processed presentation data:", error);
    return null;
  }
}

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

  const [loadingProcessedData, setLoadingProcessedData] = useState(false);

  // Reset state per export attempt
  const handleDownloadPptxWithFetch = async () => {
    setLoadingProcessedData(true);

    try {
      // 1. Fetch the correct "full" campaign data (with survey/instance)
      const campaignData = await fetchFullCampaignData(
        campaign.id,
        campaign.instance?.id
      );

      if (!campaignData) {
        setLoadingProcessedData(false);
        return;
      }

      // 2. Fetch processed responses data needed for the slides
      const processedData = await fetchProcessedPresentationData(
        campaign.id,
        campaign.instance?.id
      );

      if (!processedData) {
        setLoadingProcessedData(false);
        return;
      }

      // 3. All data present, trigger export (useFeedback handles own toasts)
      await handleExport(campaignData, processedData);

    } finally {
      setLoadingProcessedData(false);
    }
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
