
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const ProfileNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-lg">Profile not found</div>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    </div>
  );
};
