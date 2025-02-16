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
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  Twitter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We'll get back to you as soon as possible.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary">Open Office Survey</div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-600 hover:text-primary">Features</a>
          <a href="/features" className="text-gray-600 hover:text-primary">Feature Details</a>
          <a href="#how-it-works" className="text-gray-600 hover:text-primary">How It Works</a>
          <a href="#contact" className="text-gray-600 hover:text-primary">Contact</a>
          <Button 
            variant="outline" 
            onClick={() => navigate('/login')}
            className="font-medium"
          >
            Login
          </Button>
        </div>
      </nav>

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

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Get In Touch</h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Mail className="h-6 w-6 text-primary" />
                <span>contact@openofficesurvey.com</span>
              </div>
              <div className="flex items-center space-x-4">
                <Phone className="h-6 w-6 text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-4">
                <MapPin className="h-6 w-6 text-primary" />
                <span>123 Office Street, Business District</span>
              </div>
              <div className="flex space-x-4 pt-4">
                <a href="#" className="text-gray-600 hover:text-primary">
                  <Github className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-600 hover:text-primary">
                  <Linkedin className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-600 hover:text-primary">
                  <Twitter className="h-6 w-6" />
                </a>
              </div>
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <Input placeholder="Your Name" />
              <Input type="email" placeholder="Your Email" />
              <Textarea placeholder="Your Message" className="h-32" />
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Open Office Survey</h3>
              <p className="text-gray-400">Transform your workplace with meaningful feedback</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Survey Management</li>
                <li>Analytics Dashboard</li>
                <li>Team Collaboration</li>
                <li>Security</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Support</li>
                <li>Sales</li>
                <li>Partnerships</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Open Office Survey. All rights reserved.</p>
            <p className="text-sm mt-2 opacity-50">Crafted with ♥ by THK</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
