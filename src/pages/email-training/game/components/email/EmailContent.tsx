
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { GeneratedEmail } from "../../types";

interface EmailContentProps {
  email: GeneratedEmail | null;
}

export function EmailContent({ email }: EmailContentProps) {
  if (!email) {
    return (
      <div className="flex items-center justify-center p-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <div className="whitespace-pre-wrap">{email.content}</div>
      {email.key_points && email.key_points.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-2">Key Points:</h3>
          <ul className="list-disc pl-4 space-y-1">
            {email.key_points.map((point, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
