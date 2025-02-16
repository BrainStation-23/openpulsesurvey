
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Transform Your Office Feedback Culture
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Create, manage, and analyze employee surveys with powerful insights. Make data-driven decisions to improve your workplace.
        </p>
        <Button 
          size="lg"
          onClick={() => navigate('/login')}
          className="font-medium"
        >
          Get Started <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Hero;
