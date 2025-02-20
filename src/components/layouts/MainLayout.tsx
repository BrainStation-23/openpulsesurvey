
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, MapPin, Phone, Linkedin, Twitter } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type ContactFormData = {
  name: string;
  email: string;
  message: string;
};

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>();

  const isActive = (path: string) => location.pathname === path;

  const handleContactSubmit = async (data: ContactFormData) => {
    try {
      // Here you would typically send the data to your backend
      console.log("Form data:", data);
      toast.success("Message sent successfully! We'll get back to you soon.");
      reset();
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    }
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
            <form onSubmit={handleSubmit(handleContactSubmit)} className="space-y-4">
              <div>
                <Input
                  placeholder="Your Name"
                  className="bg-gray-800 border-gray-700"
                  {...register("name", { required: "Name is required" })}
                  aria-invalid={errors.name ? "true" : "false"}
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Your Email"
                  className="bg-gray-800 border-gray-700"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Textarea
                  placeholder="Your Message"
                  className="h-32 bg-gray-800 border-gray-700"
                  {...register("message", {
                    required: "Message is required",
                    minLength: {
                      value: 10,
                      message: "Message must be at least 10 characters"
                    }
                  })}
                  aria-invalid={errors.message ? "true" : "false"}
                />
                {errors.message && (
                  <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
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
