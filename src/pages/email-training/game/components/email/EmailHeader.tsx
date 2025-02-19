
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle } from "lucide-react";
import type { GeneratedEmail } from "../../types";

interface EmailHeaderProps {
  email: GeneratedEmail;
}

export function EmailHeader({ email }: EmailHeaderProps) {
  return (
    <div className="space-y-4 p-6 border-b">
      <div className="flex items-start gap-4">
        <Avatar className="mt-0.5">
          <AvatarFallback>{email.from.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-semibold">{email.from.name}</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-muted-foreground">{email.from.email}</span> to <span className="text-foreground">me</span>
              </p>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{email.subject}</h2>
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
          <AlertTriangle className="h-4 w-4" />
          <p>Please verify sender authenticity before responding</p>
        </div>
      </div>
    </div>
  );
}
