
import { Button } from "@/components/ui/button";
import { Play, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ExportButton } from "./PresentationView/components/ExportButton";

interface PresentButtonProps {
  onPresent: () => void;
  campaignId: string;
  instanceId?: string;
  disabled?: boolean;
}

export function PresentButton({ onPresent, campaignId, instanceId, disabled }: PresentButtonProps) {
  return (
    <DropdownMenu>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
