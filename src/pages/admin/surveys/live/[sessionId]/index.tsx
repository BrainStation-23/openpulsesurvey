
import { useParams } from "react-router-dom";
import { SessionHeader } from "./components/SessionHeader";
import { QuestionManager } from "./components/QuestionManager";
import { PresentationView } from "./components/PresentationView";
import { ParticipantList } from "./components/ParticipantList";

export default function LiveSessionControlPage() {
  const { sessionId } = useParams();

  // TODO: Implement session data fetching and real-time updates
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <SessionHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <QuestionManager />
          <ParticipantList />
        </div>
        <PresentationView />
      </div>
    </div>
  );
}
