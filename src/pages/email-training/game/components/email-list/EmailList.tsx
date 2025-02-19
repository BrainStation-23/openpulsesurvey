
import { ScrollArea } from "@/components/ui/scroll-area";
import { Inbox, AlertCircle, RefreshCw } from "lucide-react";
import type { GeneratedEmail } from "../../types";
import { EmailListItem } from "./EmailListItem";
import { Button } from "@/components/ui/button";

interface EmailListProps {
  email: GeneratedEmail | null;
  error?: string | null;
  onRetry?: () => void;
}

export function EmailList({ email, error, onRetry }: EmailListProps) {
  return (
    <div className="flex h-full flex-col border-r">
      <div className="flex items-center gap-2 p-4 border-b bg-background">
        <Inbox className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-medium">Training Inbox</h2>
      </div>
      <ScrollArea className="flex-1">
        {error ? (
          <div className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y">
            <EmailListItem email={email} isSelected />
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
