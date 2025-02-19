
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { EmailHeader } from "../email/EmailHeader";
import { EmailContent } from "../email/EmailContent";
import { EmailEditor } from "../email/EmailEditor";
import type { GeneratedEmail, EmailResponse } from "../../types";

interface MailDisplayProps {
  email: GeneratedEmail;
  onSubmit: (response: EmailResponse) => Promise<void>;
}

export function MailDisplay({ email, onSubmit }: MailDisplayProps) {
  return (
    <div className="flex h-full flex-col">
      <EmailHeader email={email} />
      <Separator />
      <ScrollArea className="flex-1">
        <div className="p-6">
          <EmailContent email={email} />
        </div>
      </ScrollArea>
      <Separator className="my-4" />
      <div className="p-6 pt-0">
        <Card className="p-4">
          <EmailEditor onSubmit={onSubmit} />
        </Card>
      </div>
    </div>
  );
}
