import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle, 
  BarChart3, 
  Users, 
  Shield, 
  Settings2, 
  Briefcase,
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero Section */}
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

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Survey Management",
                icon: CheckCircle,
                description: "Create and manage surveys with an intuitive interface"
              },
              {
                title: "Advanced Analytics",
                icon: BarChart3,
                description: "Get detailed insights with powerful analytics dashboard"
              },
              {
                title: "Team Collaboration",
                icon: Users,
                description: "Work together seamlessly with role-based access"
              },
              {
                title: "Secure Platform",
                icon: Shield,
                description: "Enterprise-grade security for your sensitive data"
              },
              {
                title: "Customizable",
                icon: Settings2,
                description: "Tailor the platform to match your organization"
              },
              {
                title: "Employee Management",
                icon: Briefcase,
                description: "Comprehensive employee data management"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Create Survey",
                description: "Design your survey with our intuitive builder"
              },
              {
                step: "2",
                title: "Distribute",
                description: "Send surveys to your team members"
              },
              {
                step: "3",
                title: "Collect Responses",
                description: "Gather feedback automatically"
              },
              {
                step: "4",
                title: "Analyze Results",
                description: "Get insights from powerful analytics"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
