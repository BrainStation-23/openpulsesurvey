
import { Button } from "@/components/ui/button";
import { Play, Download, Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ExportButton } from "./PresentationView/components/ExportButton";
import { SharePresentationModal } from "./PresentationView/components/SharePresentationModal";
import { useState } from "react";

interface PresentButtonProps {
  onPresent: () => void;
  campaignId: string;
  instanceId?: string;
  disabled?: boolean;
}

export function PresentButton({ onPresent, campaignId, instanceId, disabled }: PresentButtonProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleShareClick = () => {
    setDropdownOpen(false); // Close the dropdown
    setShowShareModal(true); // Open the share modal
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className="gap-2"
            disabled={disabled}
          >
            <Play className="h-4 w-4" />
            Present
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onPresent}>
            <Play className="h-4 w-4 mr-2" />
            Start Presentation
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <ExportButton 
              campaignId={campaignId} 
              instanceId={instanceId}
              variant="dropdown"
            />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareClick}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Presentation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SharePresentationModal
        campaignId={campaignId}
        instanceId={instanceId}
        open={showShareModal}
        onOpenChange={setShowShareModal}
      />
    </>
  );
}
