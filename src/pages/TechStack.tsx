
import { Terminal, Database, Globe, Code2, Github, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const TechStack = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Built with Open Source Excellence
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Our platform leverages the power of battle-tested open source technologies,
              ensuring transparency, security, and continuous innovation.
            </p>
            <div className="flex items-center justify-center">
              <Button 
                variant="default" 
                size="lg" 
                className="gap-2"
                onClick={() => window.open('https://github.com/BrainStation-23/openofficesurvey', '_blank')}
              >
                <Github className="h-5 w-5" />
                View on GitHub
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Supabase Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <Database className="h-12 w-12 text-primary mr-4" />
              <h2 className="text-3xl font-bold">Powered by Supabase</h2>
            </div>
            <p className="text-xl text-gray-600 text-center mb-12">
              Built on PostgreSQL, the world's most advanced open source database
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Database Features</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="bg-primary/10 p-1 rounded mr-2">
                      <Code2 className="h-5 w-5 text-primary" />
                    </span>
                    <div>
                      <span className="font-medium">Row Level Security</span>
                      <p className="text-gray-600">Enterprise-grade data protection at the database level</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary/10 p-1 rounded mr-2">
                      <Globe className="h-5 w-5 text-primary" />
                    </span>
                    <div>
                      <span className="font-medium">Real-time Subscriptions</span>
                      <p className="text-gray-600">Live data updates powered by PostgreSQL</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Edge Functions</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="bg-primary/10 p-1 rounded mr-2">
                      <Terminal className="h-5 w-5 text-primary" />
                    </span>
                    <div>
                      <span className="font-medium">Deno Runtime</span>
                      <p className="text-gray-600">Secure, high-performance JavaScript/TypeScript runtime</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary/10 p-1 rounded mr-2">
                      <Database className="h-5 w-5 text-primary" />
                    </span>
                    <div>
                      <span className="font-medium">Storage Solutions</span>
                      <p className="text-gray-600">Scalable object storage for all your files</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frontend Stack */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Open Source Frontend Stack</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "React 18",
                stars: "200k+",
                description: "A JavaScript library for building user interfaces",
                link: "https://github.com/facebook/react"
              },
              {
                name: "TypeScript",
                stars: "90k+",
                description: "JavaScript with syntax for types",
                link: "https://github.com/microsoft/TypeScript"
              },
              {
                name: "Tailwind CSS",
                stars: "70k+",
                description: "A utility-first CSS framework",
                link: "https://github.com/tailwindlabs/tailwindcss"
              },
              {
                name: "Vite",
                stars: "50k+",
                description: "Next generation frontend tooling",
                link: "https://github.com/vitejs/vite"
              },
              {
                name: "TanStack Query",
                stars: "30k+",
                description: "Powerful asynchronous state management",
                link: "https://github.com/TanStack/query"
              },
              {
                name: "Survey.js",
                stars: "8k+",
                description: "JavaScript Survey and Form Library",
                link: "https://github.com/surveyjs/survey-library"
              },
              {
                name: "Recharts",
                stars: "20k+",
                description: "Composable charting library built on React components",
                link: "https://github.com/recharts/recharts"
              },
              {
                name: "Papa Parse",
                stars: "10k+",
                description: "Powerful CSV parser for JavaScript",
                link: "https://github.com/mholt/PapaParse"
              },
              {
                name: "Zod",
                stars: "25k+",
                description: "TypeScript-first schema validation",
                link: "https://github.com/colinhacks/zod"
              },
              {
                name: "Lucide Icons",
                stars: "5k+",
                description: "Beautiful & consistent icons",
                link: "https://github.com/lucide-icons/lucide"
              }
            ].map((tech) => (
              <div key={tech.name} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">{tech.name}</h3>
                  <a 
                    href={tech.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
                <p className="text-gray-600 mb-4">{tech.description}</p>
                <div className="flex items-center text-gray-500">
                  <Github className="h-4 w-4 mr-2" />
                  <span>{tech.stars} stars</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Experience */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Developer Experience</h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Type Safety",
                description: "Full TypeScript support with strict type checking for robust code"
              },
              {
                title: "Code Quality",
                description: "ESLint and Prettier ensure consistent, high-quality code"
              },
              {
                title: "Fast Refresh",
                description: "Lightning-fast hot module replacement during development"
              },
              {
                title: "Build Optimization",
                description: "Optimized production builds with code splitting and tree shaking"
              }
            ].map((feature) => (
              <div key={feature.title} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TechStack;
