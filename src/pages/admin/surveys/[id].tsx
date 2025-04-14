
import { useParams } from "react-router-dom";

export default function SurveyDetailsPage() {
  const { id } = useParams();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Survey Details</h1>
      <p>Survey ID: {id}</p>
    </div>
  );
}
