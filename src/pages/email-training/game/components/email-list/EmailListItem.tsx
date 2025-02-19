
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { GeneratedEmail } from "../../types";

interface EmailListItemProps {
  email: GeneratedEmail | null;
  isSelected?: boolean;
  onClick?: () => void;
}

export function EmailListItem({ email, isSelected, onClick }: EmailListItemProps) {
  if (!email) {
    return (
      <div className="w-full flex items-center justify-center p-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 text-left transition-colors hover:bg-accent/50",
        isSelected && "bg-accent/50"
      )}
    >
      <Avatar className="mt-0.5 h-8 w-8">
        <AvatarFallback className="text-xs">{email.from.name[0]}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium truncate">{email.from.name}</p>
          <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
            {formatDistanceToNow(new Date(), { addSuffix: true })}
          </span>
        </div>
        <p className="text-xs font-medium truncate">{email.subject}</p>
        <p className="text-xs text-muted-foreground line-clamp-2 break-words">{email.content}</p>
      </div>
    </button>
  );
}
