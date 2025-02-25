
import { LiveSession } from "../../../types";

interface PresentationViewProps {
  session: LiveSession;
}

export function PresentationView({ session }: PresentationViewProps) {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Presentation View</h2>
      {/* Implementation coming soon */}
      <div className="text-muted-foreground">Response visualization will be implemented here</div>
    </div>
  );
}
