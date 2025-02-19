
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";
import type { GeneratedEmail } from "../types";

interface ReceivedEmailProps {
  email: GeneratedEmail;
}

export function ReceivedEmail({ email }: ReceivedEmailProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Received Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">From</p>
          <p className="text-sm">{email.from.name} ({email.from.email})</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Subject</p>
          <p className="text-sm font-medium">{email.subject}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Message</p>
          <div className="rounded-md border bg-muted p-4">
            <p className="text-sm whitespace-pre-wrap">{email.content}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
