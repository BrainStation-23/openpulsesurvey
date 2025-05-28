
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToPptx } from "../utils/pptxExport";
import { usePresentationResponses } from "../hooks/usePresentationResponses";
import { useCampaignData } from "../hooks/useCampaignData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExportButtonProps {
  campaignId: string;
  instanceId?: string | null;
  variant?: 'button' | 'dropdown';
}

export function ExportButton({ campaignId, instanceId, variant = 'button' }: Readonly<ExportButtonProps>) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  const {
    data: processedData,
    refetch: refetchResponses,
    isLoading: isLoadingResponses,
    isError: isResponsesError
  } = usePresentationResponses(campaignId, instanceId || undefined);

  const {
    data: campaignData,
    refetch: refetchCampaign,
    isLoading: isLoadingCampaign,
    isError: isCampaignError
  } = useCampaignData(campaignId, instanceId);

  const isLoadingData = isLoadingResponses || isLoadingCampaign;
  const isError = isResponsesError || isCampaignError;

  const handleExport = async () => {
    try {
      setExporting(true);
      setProgress(0);
      
      if (!processedData || !campaignData) {
        await Promise.all([refetchResponses(), refetchCampaign()]);
        const [responsesResult, campaignResult] = await Promise.all([refetchResponses(), refetchCampaign()]);
        
        if (!responsesResult.data || !campaignResult.data) {
          throw new Error("Failed to load export data");
        }
        
        await generatePptx(campaignResult.data, responsesResult.data);
      } else {
        await generatePptx(campaignData, processedData);
      }
      
      toast({
        title: "Success",
        description: "Presentation has been exported to PPTX successfully",
      });
    } catch (error) {
      console.error("Error exporting PPTX:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the PPTX presentation",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };
  
  const generatePptx = async (campaign: any, processedResponses: any) => {
    await exportToPptx(campaign, processedResponses, (progress) => {
      setProgress(progress);
    });
  };

  if (variant === 'dropdown') {
    return (
      <div className="flex items-center w-full px-2 py-1.5 cursor-pointer" onClick={handleExport}>
        <Download className="h-4 w-4 mr-2" />
        <span>Download PPTX</span>
        {(isLoadingData || exporting) && (
          <Loader className="h-4 w-4 ml-auto animate-spin" />
        )}
      </div>
    );
  }
  
  const isDisabled = exporting ?? isLoadingData;
  const showProgress = exporting;
  
  const getButtonText = () => {
    if (isLoadingData) return "Loading data...";
    if (exporting) return `Exporting... ${progress}%`;
    return "Export to PPTX";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExport}
              disabled={isDisabled}
              className="text-black hover:bg-black/20 hover:text-black relative"
            >
              {isLoadingData || exporting ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
            
            {showProgress && (
              <div className="absolute -bottom-4 left-0 w-full">
                <Progress value={progress} className="h-1" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getButtonText()}</p>
          {isError && <p className="text-destructive">Error loading data</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
