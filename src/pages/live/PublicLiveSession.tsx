
import { useParams } from "react-router-dom";

export default function PublicLiveSession() {
  const { joinCode } = useParams();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Live Session</h1>
      <p>Join code: {joinCode}</p>
    </div>
  );
}
