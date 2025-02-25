
import { LiveSession } from "../../../types";

interface QuestionManagerProps {
  session: LiveSession;
}

export function QuestionManager({ session }: QuestionManagerProps) {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Questions</h2>
      {/* Implementation coming soon */}
      <div className="text-muted-foreground">Question management interface will be implemented here</div>
    </div>
  );
}
