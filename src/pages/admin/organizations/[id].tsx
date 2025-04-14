
import { useParams } from "react-router-dom";

export default function OrganizationDetailsPage() {
  const { id } = useParams();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Organization Details</h1>
      <p>Organization ID: {id}</p>
    </div>
  );
}
