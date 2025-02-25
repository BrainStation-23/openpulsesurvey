
import { JoinCodeDisplay } from "./JoinCodeDisplay";
import { ParticipantCounter } from "./ParticipantCounter";

export function SessionHeader() {
  // TODO: Implement session header with status controls
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1>Session Name</h1>
        <JoinCodeDisplay />
      </div>
      <ParticipantCounter />
    </div>
  );
}
