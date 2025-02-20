
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, CheckCircle, Shield, Settings2, Users, BrainCircuit, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero Section with Background Image */}
      <div className="relative bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black/50 z-0" />
        <div 
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1519389950473-47ba0277781c')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Transform Your Workplace Feedback Culture
            </h1>
            <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto animate-fade-in">
              Open Office Survey helps organizations build a culture of continuous improvement through meaningful feedback. 
              Our comprehensive platform makes it easy to create, manage, and analyze employee surveys.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/login')}
              className="animate-fade-in bg-white text-purple-900 hover:bg-gray-100 font-medium text-lg px-8"
            >
              Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Feature Sections */}
      <div className="container mx-auto px-4 space-y-32 py-32">
        {/* Survey Creation & Management */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block bg-purple-100 rounded-full px-4 py-2 text-purple-700">
              Survey Management
            </div>
            <h2 className="text-4xl font-bold mb-6">Create Engaging Surveys in Minutes</h2>
            <div className="space-y-6 text-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Interactive Survey Builder</h3>
                  <p className="text-gray-600">Build professional surveys with our drag-and-drop interface. Choose from multiple question types and customize them to match your needs.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Smart Templates</h3>
                  <p className="text-gray-600">Get started quickly with our pre-built templates for employee engagement, satisfaction, and performance reviews.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Advanced Logic</h3>
                  <p className="text-gray-600">Create dynamic surveys with branching logic and skip patterns based on responses.</p>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="bg-gradient-to-br from-purple-100 to-indigo-50 rounded-2xl p-8 aspect-video relative overflow-hidden"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div className="absolute inset-0 bg-purple-900/10 backdrop-blur-sm" />
          </div>
        </section>

        {/* Analytics & Reporting */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div 
            className="bg-gradient-to-br from-blue-100 to-cyan-50 rounded-2xl p-8 aspect-video relative overflow-hidden order-2 md:order-1"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-sm" />
          </div>
          <div className="space-y-6 order-1 md:order-2">
            <div className="inline-block bg-blue-100 rounded-full px-4 py-2 text-blue-700">
              Analytics
            </div>
            <h2 className="text-4xl font-bold mb-6">Powerful Insights at Your Fingertips</h2>
            <div className="space-y-6 text-lg">
              <div className="flex items-start gap-3">
                <BarChart3 className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Real-time Dashboard</h3>
                  <p className="text-gray-600">Monitor response rates, track completion status, and analyze trends as they happen.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BrainCircuit className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">AI-Powered Analysis</h3>
                  <p className="text-gray-600">Get intelligent insights from text responses and identify patterns in feedback automatically.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Custom Reports</h3>
                  <p className="text-gray-600">Generate beautiful presentations and export data in multiple formats for deeper analysis.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Privacy */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block bg-green-100 rounded-full px-4 py-2 text-green-700">
              Enterprise-Ready
            </div>
            <h2 className="text-4xl font-bold mb-6">Secure and Scalable Platform</h2>
            <div className="space-y-6 text-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Data Protection</h3>
                  <p className="text-gray-600">Enterprise-grade security with end-to-end encryption and regular security audits.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Role-Based Access</h3>
                  <p className="text-gray-600">Granular permissions and access controls to ensure data privacy and compliance.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Settings2 className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Custom Configuration</h3>
                  <p className="text-gray-600">Flexible settings to match your organization's structure and needs.</p>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="bg-gradient-to-br from-green-100 to-emerald-50 rounded-2xl p-8 aspect-video relative overflow-hidden"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div className="absolute inset-0 bg-green-900/10 backdrop-blur-sm" />
          </div>
        </section>
      </div>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-purple-900 to-indigo-900 text-white py-24">
        <div className="absolute inset-0 bg-black/30" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1470813740244-df37b8c1edcb')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Workplace?
          </h2>
          <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto">
            Join organizations that trust Open Office Survey to improve their workplace culture through meaningful feedback.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/login')}
              className="bg-white text-purple-900 hover:bg-gray-100 font-medium text-lg px-8"
            >
              Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/contact')}
              className="border-white text-white hover:bg-white/10 font-medium text-lg px-8"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
