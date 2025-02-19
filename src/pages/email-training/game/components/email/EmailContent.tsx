
import { Card } from "@/components/ui/card";
import type { GeneratedEmail } from "../../types";

interface EmailContentProps {
  email: GeneratedEmail;
}

export function EmailContent({ email }: EmailContentProps) {
  return (
    <Card className="p-6 bg-muted/50">
      <div className="prose dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap">{email.content}</div>
        {email.key_points && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Key Points:</h4>
            <ul className="list-disc pl-4 space-y-1">
              {email.key_points.map((point, index) => (
                <li key={index} className="text-sm text-muted-foreground">{point}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
