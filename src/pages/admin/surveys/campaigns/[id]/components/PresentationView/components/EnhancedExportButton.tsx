
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, ChevronDown, Sliders, FileText } from 'lucide-react';
import { CampaignData } from '../types';
import { useEnhancedPptxExport } from '../hooks/useEnhancedPptxExport';
import { ExportDialog } from './ExportDialog';

interface EnhancedExportButtonProps {
  campaign: CampaignData;
  instanceId?: string;
  className?: string;
}

export function EnhancedExportButton({ campaign, instanceId, className }: EnhancedExportButtonProps) {
  const { 
    handleQuickExport, 
    openConfigDialog, 
    closeConfigDialog,
    showConfigDialog,
    exporting, 
    progress 
  } = useEnhancedPptxExport();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={className} disabled={exporting}>
            {exporting ? (
              <>
                Exporting ({progress}%)
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleQuickExport(campaign, instanceId)}>
            <FileText className="mr-2 h-4 w-4" />
            Quick Export
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openConfigDialog}>
            <Sliders className="mr-2 h-4 w-4" />
            Advanced Export
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExportDialog 
        open={showConfigDialog} 
        onOpenChange={closeConfigDialog}
        campaign={campaign}
        instanceId={instanceId}
      />
    </>
  );
}
