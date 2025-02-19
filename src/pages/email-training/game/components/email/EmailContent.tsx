
import { Card } from "@/components/ui/card";
import type { GeneratedEmail } from "../../types";

interface EmailContentProps {
  email: GeneratedEmail;
}

export function EmailContent({ email }: EmailContentProps) {
  return (
    <div className="space-y-6">
      <div className="prose dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap text-base leading-relaxed">
          {email.content}
        </div>
      </div>
      {email.key_points && (
        <Card className="p-4 bg-muted/50">
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Key Points:</h4>
          <ul className="list-disc pl-4 space-y-1">
            {email.key_points.map((point, index) => (
              <li key={index} className="text-sm text-muted-foreground">{point}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
