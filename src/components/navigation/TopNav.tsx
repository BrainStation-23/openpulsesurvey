
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useState } from "react";

const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Removed navigationLinks for features, tech-stack, why-us
  const navigationLinks: { path: string, label: string }[] = [];

  return (
    <header className="border-b relative">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold">
              Open Office Survey
            </Link>
            {/* Navigation removed as no links remain */}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/login")}>
              Login
            </Button>
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Navigation Menu removed as no links remain */}
    </header>
  );
};

export default TopNav;
