
import { ScrollArea } from "@/components/ui/scroll-area";
import { Inbox } from "lucide-react";
import type { GeneratedEmail } from "../../types";
import { EmailListItem } from "./EmailListItem";

interface EmailListProps {
  email: GeneratedEmail | null;
}

export function EmailList({ email }: EmailListProps) {
  if (!email) return null;

  return (
    <div className="flex h-full flex-col border-r">
      <div className="flex items-center gap-2 p-4 border-b bg-background">
        <Inbox className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-medium">Training Inbox</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="divide-y">
          <EmailListItem email={email} isSelected />
        </div>
      </ScrollArea>
    </div>
  );
}
