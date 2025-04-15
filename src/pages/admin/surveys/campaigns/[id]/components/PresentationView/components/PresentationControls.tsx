
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Maximize, 
  Minimize, 
  ArrowLeft 
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { usePdfExport } from "../hooks/usePdfExport";
import { CampaignData } from "../types";
import { ExportConfigDialog } from "./ExportConfigDialog";
import { PPTXExportConfig, DEFAULT_EXPORT_CONFIG } from "../types/exportConfig";

interface PresentationControlsProps {
  onBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onFullscreen: () => void;
  isFirstSlide: boolean;
  isLastSlide: boolean;
  isFullscreen: boolean;
  currentSlide: number;
  totalSlides: number;
  campaign: CampaignData;
}

export function PresentationControls({
  onBack,
  onPrevious,
  onNext,
  onFullscreen,
  isFirstSlide,
  isLastSlide,
  isFullscreen,
  currentSlide,
  totalSlides,
  campaign,
}: PresentationControlsProps) {
  const { handleExport, exporting, progress } = usePdfExport();
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleConfiguredExport = (config: PPTXExportConfig) => {
    if (!campaign) {
      toast({
        title: "Export failed",
        description: "Campaign data not available",
        variant: "destructive",
      });
      return;
    }

    handleExport(campaign, config);
  };

  return (
    <div className="fixed z-20 bottom-4 left-0 right-0 flex justify-center items-center gap-2">
      <div className="p-2 rounded-full bg-background border shadow-lg flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
          className="rounded-full"
          aria-label="Back to campaign"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="h-6 w-px bg-muted-foreground/30" />
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onPrevious}
          disabled={isFirstSlide}
          className="rounded-full"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <span className="px-2 text-sm text-muted-foreground">
          {currentSlide + 1} / {totalSlides}
        </span>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onNext}
          disabled={isLastSlide}
          className="rounded-full"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
        
        <div className="h-6 w-px bg-muted-foreground/30" />
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onFullscreen}
          className="rounded-full"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setConfigDialogOpen(true)}
          disabled={exporting}
          className="rounded-full"
          aria-label="Export to PowerPoint"
        >
          {exporting ? (
            <LoadingSpinner size="sm" percentage={progress} />
          ) : (
            <Download className="w-5 h-5" />
          )}
        </Button>
      </div>

      <ExportConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        onExport={handleConfiguredExport}
        campaign={campaign}
      />
    </div>
  );
}
