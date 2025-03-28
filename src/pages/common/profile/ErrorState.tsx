
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ErrorStateProps {
  message: string;
}

export const ErrorState = ({ message }: ErrorStateProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-lg text-destructive">
          Error loading profile: {message}
        </div>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    </div>
  );
};
