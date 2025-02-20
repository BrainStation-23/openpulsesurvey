
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, MapPin, Phone, Facebook, Twitter, Linkedin, Github } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const isActive = (path: string) => location.pathname === path;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent successfully! We'll get back to you soon.");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-xl font-bold">
                Open Office Survey
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/features"
                  className={`text-sm ${
                    isActive("/features")
                      ? "text-primary font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Features
                </Link>
                <Link
                  to="/why-us"
                  className={`text-sm ${
                    isActive("/why-us")
                      ? "text-primary font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Why Us?
                </Link>
                <Link
                  to="/tech-stack"
                  className={`text-sm ${
                    isActive("/tech-stack")
                      ? "text-primary font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Tech Stack
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/login")}>Get Started</Button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Open Office Survey</h3>
              <p className="mb-4 text-gray-400">
                Transform your workplace with meaningful feedback and data-driven insights.
              </p>
              <div className="flex space-x-4">
                <a href="https://facebook.com" className="hover:text-white">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://twitter.com" className="hover:text-white">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com" className="hover:text-white">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="https://github.com/BrainStation-23/openofficesurvey" className="hover:text-white">
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/features" className="hover:text-white">Features</Link>
                </li>
                <li>
                  <Link to="/why-us" className="hover:text-white">Why Us?</Link>
                </li>
                <li>
                  <Link to="/tech-stack" className="hover:text-white">Tech Stack</Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white">Login</Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Contact Info</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 mt-1" />
                  <span>Level 10, Plot 2, Bir Uttam AK Khandakar Road, Mohakhali C/A, Dhaka-1212</span>
                </li>
                <li className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  <span>+880 9612 323232</span>
                </li>
                <li className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>hello@brainstation-23.com</span>
                </li>
              </ul>
            </div>

            {/* Contact Form */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Send us a message</h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                  required
                />
                <Textarea
                  placeholder="Your message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                  required
                />
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>© 2024 Open Office Survey. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
