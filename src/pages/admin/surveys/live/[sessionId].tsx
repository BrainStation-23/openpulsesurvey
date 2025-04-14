
import { useParams } from "react-router-dom";

export default function LiveSessionDetailsPage() {
  const { sessionId } = useParams();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Live Session Details</h1>
      <p>Session ID: {sessionId}</p>
    </div>
  );
}
