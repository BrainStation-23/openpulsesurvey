
import { useParams } from "react-router-dom";

export default function UserDetailsPage() {
  const { id } = useParams();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Details</h1>
      <p>User ID: {id}</p>
    </div>
  );
}
