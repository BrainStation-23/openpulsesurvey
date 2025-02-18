
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Send } from "lucide-react";
import type { EmailResponse } from "../types";

interface ResponseFormProps {
  onSubmit: (response: EmailResponse) => Promise<void>;
}

export function ResponseForm({ onSubmit }: ResponseFormProps) {
  const [isSending, setIsSending] = useState(false);
  const [response, setResponse] = useState<EmailResponse>({
    subject: "",
    content: ""
  });

  const handleSubmit = async () => {
    setIsSending(true);
    try {
      await onSubmit(response);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-4 h-4" />
          Your Response
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground" htmlFor="subject">
            Subject
          </label>
          <Input
            id="subject"
            value={response.subject}
            onChange={(e) => setResponse(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Enter your subject line"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground" htmlFor="response">
            Message
          </label>
          <Textarea
            id="response"
            value={response.content}
            onChange={(e) => setResponse(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Type your response here..."
            className="min-h-[200px]"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          className="w-full gap-2"
          disabled={!response.subject || !response.content || isSending}
        >
          {isSending ? (
            <LoadingSpinner className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Submit Response
        </Button>
      </CardFooter>
    </Card>
  );
}
