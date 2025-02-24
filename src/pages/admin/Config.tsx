
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { navigationItems } from "@/config/navigation";
import { TourButton } from "@/components/onboarding/TourButton";
import { Tour } from "@/components/onboarding/Tour";

export default function AdminConfig() {
  const navigate = useNavigate();
  
  // Find the Platform Config section from navigation
  const configSection = navigationItems.find(item => item.path === "/admin/config");
  const configItems = configSection?.children || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Platform Configuration</h1>
        </div>
        <TourButton tourId="platform_setup" title="Platform Setup Guide" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {configItems.map((item) => (
          <Card 
            key={item.path}
            className={`hover:bg-accent cursor-pointer transition-colors config-${item.path.split('/').pop()}`}
            onClick={() => navigate(item.path)}
          >
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </div>
              <CardDescription>
                {getConfigDescription(item.title)}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Tour />
    </div>
  );
}

function getConfigDescription(title: string): string {
  const descriptions: Record<string, string> = {
    "SBUs": "Manage Strategic Business Units and their hierarchies",
    "Email": "Configure email settings and templates",
    "Location": "Manage office locations and regions",
    "Level": "Define employee levels and grades",
    "Employment Type": "Configure different types of employment contracts",
    "Employee Type": "Manage employee classifications",
    "Employee Role": "Define roles and responsibilities",
    "AI Prompts": "Customize AI analysis templates"
  };
  
  return descriptions[title] || "";
}
