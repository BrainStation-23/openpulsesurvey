
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, CheckCircle, Shield, Settings2, Users, BrainCircuit, FileText, Binary, Presentation } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Features = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary">Open Office Survey</div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="/" className="text-gray-600 hover:text-primary">Home</a>
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
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
          Powerful Features for Modern Workplaces
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Discover how Open Office Survey transforms your organization's feedback culture with our comprehensive feature set.
        </p>
      </div>

      {/* Feature Sections */}
      <div className="container mx-auto px-4 space-y-32 mb-32">
        {/* Survey Creation & Management */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 text-primary mb-4">
              <FileText className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Survey Creation & Management</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Interactive Survey Builder</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Multiple question types (Rating, Text, Multiple Choice)</li>
                  <li>Advanced logic branching for dynamic surveys</li>
                  <li>Customizable themes and branding</li>
                  <li>Real-time preview functionality</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Campaign Management</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Automated scheduling and distribution</li>
                  <li>Smart reminder system</li>
                  <li>Target specific departments or teams</li>
                  <li>Track campaign progress in real-time</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-6 aspect-video flex items-center justify-center">
            <p className="text-gray-500">Survey Builder Screenshot</p>
          </div>
        </section>

        {/* Analytics & Reporting */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 bg-gray-100 rounded-lg p-6 aspect-video flex items-center justify-center">
            <p className="text-gray-500">Analytics Dashboard Screenshot</p>
          </div>
          <div className="order-1 md:order-2">
            <div className="flex items-center gap-2 text-primary mb-4">
              <BarChart3 className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Analytics & Reporting</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Response Analytics</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Real-time response tracking and visualization</li>
                  <li>Detailed trend analysis with interactive charts</li>
                  <li>Completion rate monitoring</li>
                  <li>Export reports in multiple formats</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Department Insights</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>SBU-wise performance metrics</li>
                  <li>Team participation analytics</li>
                  <li>Demographic breakdown analysis</li>
                  <li>Comparative performance reports</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Employee Management */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 text-primary mb-4">
              <Users className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Employee Management</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Organization Structure</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Comprehensive SBU management</li>
                  <li>Multi-location support</li>
                  <li>Hierarchical role management</li>
                  <li>Team structure visualization</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Employee Configuration</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Flexible employment type settings</li>
                  <li>Role-based access control</li>
                  <li>Custom permission management</li>
                  <li>Bulk user management</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-6 aspect-video flex items-center justify-center">
            <p className="text-gray-500">Employee Management Screenshot</p>
          </div>
        </section>

        {/* AI-Powered Analysis */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 bg-gray-100 rounded-lg p-6 aspect-video flex items-center justify-center">
            <p className="text-gray-500">AI Analysis Screenshot</p>
          </div>
          <div className="order-1 md:order-2">
            <div className="flex items-center gap-2 text-primary mb-4">
              <BrainCircuit className="h-6 w-6" />
              <h2 className="text-2xl font-bold">AI-Powered Analysis</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Intelligent Insights</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Automated response analysis</li>
                  <li>Sentiment analysis of text responses</li>
                  <li>Pattern recognition in feedback</li>
                  <li>Trend prediction and recommendations</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Presentation Tools</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Auto-generated presentation slides</li>
                  <li>Custom visualization options</li>
                  <li>Interactive presentation mode</li>
                  <li>Export to multiple formats</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Administration */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 text-primary mb-4">
              <Shield className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Security & Administration</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Access Control</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Role-based access control (RBAC)</li>
                  <li>Fine-grained permissions system</li>
                  <li>Secure authentication</li>
                  <li>Activity logging and monitoring</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Platform Configuration</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Email system configuration</li>
                  <li>Custom branding options</li>
                  <li>Integration settings</li>
                  <li>System preferences management</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-6 aspect-video flex items-center justify-center">
            <p className="text-gray-500">Security Settings Screenshot</p>
          </div>
        </section>
      </div>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Workplace?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join organizations that trust Open Office Survey to improve their workplace culture through meaningful feedback.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/login')}
            className="font-medium"
          >
            Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Features;
