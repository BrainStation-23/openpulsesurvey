
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToPptx } from "../utils/pptxExport";
import { useExportData } from "../hooks/useExportData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExportButtonProps {
  campaignId: string;
  instanceId?: string | null;
}

export function ExportButton({ campaignId, instanceId }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  // Use the dedicated export data hook
  const {
    data: exportData,
    refetch,
    isLoading: isLoadingData,
    isError
  } = useExportData(campaignId, instanceId || undefined);

  const handleExport = async () => {
    try {
      setExporting(true);
      setProgress(0);
      
      // Fetch data if not already loaded
      if (!exportData) {
        await refetch();
        const result = await refetch();
        
        if (!result.data) {
          throw new Error("Failed to load export data");
        }
        
        await generatePptx(result.data);
      } else {
        await generatePptx(exportData);
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
  
  const generatePptx = async (data: any) => {
    await exportToPptx(data.campaign, data.processedData, (progress) => {
      setProgress(progress);
    });
  };
  
  // Determine button state
  const isDisabled = exporting || isLoadingData;
  const showProgress = exporting;
  
  // Get appropriate button text
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
