
import { useSystemVersion } from '@/hooks/useSystemVersion';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoCircle } from 'lucide-react';
import { format } from 'date-fns';

export function VersionDisplay() {
  const { version, isLoading } = useSystemVersion();

  if (isLoading) {
    return <span className="text-xs text-muted-foreground">Loading version...</span>;
  }

  if (!version) {
    return <span className="text-xs text-muted-foreground">Version info unavailable</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-default">
            <Badge variant="outline" className="text-xs">
              v{version.version}
            </Badge>
            <InfoCircle className="h-3 w-3 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="w-80 p-4">
          <div className="space-y-2">
            <div className="font-medium">System Version Details</div>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <span className="text-muted-foreground">Version:</span>
              <span>{version.version}</span>
              
              <span className="text-muted-foreground">Frontend:</span>
              <span>{version.frontendVersion}</span>
              
              <span className="text-muted-foreground">Backend:</span>
              <span>{version.schemaVersion}</span>
              
              <span className="text-muted-foreground">Edge Functions:</span>
              <span>{version.edgeFunctionsVersion}</span>
              
              <span className="text-muted-foreground">Applied:</span>
              <span>{format(version.appliedAt, 'MMM d, yyyy')}</span>
            </div>
            
            {version.changelog && (
              <div className="border-t pt-2 mt-2">
                <div className="font-medium">Changelog</div>
                <p className="text-sm text-muted-foreground">{version.changelog}</p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
