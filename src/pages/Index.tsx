
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 overflow-hidden">
      <div className="text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
          Welcome to{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Open Pulse Survey
          </span>
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          The easiest way to capture and analyze employee feedback.
        </p>
        <Button
          size="lg"
          className="font-medium text-base px-8"
          onClick={() => navigate("/login")}
        >
          Go to Login
        </Button>
      </div>
    </div>
  );
};

export default Index;
