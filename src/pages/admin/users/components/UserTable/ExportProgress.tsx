
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ExportProgressProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress?: number;
  total?: number;
  error?: string;
  isComplete?: boolean;
}

export function ExportProgress({
  open,
  onOpenChange,
  error,
}: ExportProgressProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exporting Users</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <LoadingSpinner size="lg" />
          <p className="text-center text-muted-foreground">
            Please wait, your file is being generated...
          </p>
          {error && (
            <p className="text-destructive text-sm text-center">
              {error}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
