
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { User2 } from "lucide-react";

interface AIResponseProps {
  response: string;
}

export function AIResponse({ response }: AIResponseProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <Avatar>
          <User2 className="h-5 w-5" />
        </Avatar>
        <div className="space-y-1">
          <p className="text-sm font-medium">Client Response</p>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-sm whitespace-pre-wrap">{response}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
