
import { CheckCircle, BarChart3, Users, Shield, Settings2, Briefcase } from "lucide-react";

const features = [
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
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-gray-600 text-lg">Everything you need to create and manage effective employee surveys</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
            >
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
