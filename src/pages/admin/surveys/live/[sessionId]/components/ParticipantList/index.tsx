
import { LiveSession } from "../../../types";

interface ParticipantListProps {
  session: LiveSession;
}

export function ParticipantList({ session }: ParticipantListProps) {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Participants</h2>
      {/* Implementation coming soon */}
      <div className="text-muted-foreground">Participant list will be implemented here</div>
    </div>
  );
}
