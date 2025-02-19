
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { GeneratedEmail } from "../../types";

interface EmailListItemProps {
  email: GeneratedEmail;
  isSelected?: boolean;
  onClick?: () => void;
}

export function EmailListItem({ email, isSelected, onClick }: EmailListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-4 p-4 text-left transition-colors hover:bg-accent",
        isSelected && "bg-accent"
      )}
    >
      <Avatar className="shrink-0">
        <AvatarFallback>{email.from[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="font-medium truncate">{email.from}</p>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm font-medium truncate">{email.subject}</p>
        <p className="text-xs text-muted-foreground truncate">{email.content.substring(0, 100)}...</p>
      </div>
    </button>
  );
}
