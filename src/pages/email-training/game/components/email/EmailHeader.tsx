
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import type { GeneratedEmail } from "../../types";

interface EmailHeaderProps {
  email: GeneratedEmail;
}

export function EmailHeader({ email }: EmailHeaderProps) {
  return (
    <div className="px-6 py-4 border-b">
      <div className="flex items-start gap-4">
        <Avatar>
          <AvatarFallback>{email.from[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{email.from}</h3>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(), { addSuffix: true })}
            </span>
          </div>
          <p className="text-xl font-semibold">{email.subject}</p>
        </div>
      </div>
    </div>
  );
}
