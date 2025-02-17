
import { Button } from "@/components/ui/button";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin, Github, Linkedin, Twitter, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const MainLayout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We'll get back to you as soon as possible.",
    });
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/features", label: "Features" },
    { to: "/tech-stack", label: "Tech Stack" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">
            Open Office Survey
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-gray-600 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="font-medium"
            >
              Login
            </Button>
          </div>

          {/* Mobile Navigation */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col space-y-4 mt-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-lg text-gray-600 hover:text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Button 
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  Login
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer with Contact Section */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto mb-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Get In Touch</h2>
              <div className="flex items-center space-x-4">
                <Mail className="h-6 w-6 text-primary" />
                <span>sales@brainstation-23.com</span>
              </div>
              <div className="flex items-center space-x-4">
                <Phone className="h-6 w-6 text-primary" />
                <span>+1 (201) 534-7200</span>
              </div>
              <div className="flex items-center space-x-4">
                <MapPin className="h-6 w-6 text-primary" />
                <span>7426 Alban Station Blvd,Suite A101, Springfield,VA 22150</span>
              </div>
              <div className="flex space-x-4 pt-4">
                <a href="https://www.linkedin.com/company/brain-station-23/" className="text-gray-400 hover:text-primary">
                  <Linkedin className="h-6 w-6" />
                </a>
                <a href="https://x.com/BrainStation23" className="text-gray-400 hover:text-primary">
                  <Twitter className="h-6 w-6" />
                </a>
              </div>
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <Input placeholder="Your Name" className="bg-gray-800 border-gray-700" />
              <Input type="email" placeholder="Your Email" className="bg-gray-800 border-gray-700" />
              <Textarea placeholder="Your Message" className="h-32 bg-gray-800 border-gray-700" />
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Brain Station 23. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
