
import { useParams } from "react-router-dom";

export default function CampaignDetailsPage() {
  const { id } = useParams();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Campaign Details</h1>
      <p>Campaign ID: {id}</p>
    </div>
  );
}
