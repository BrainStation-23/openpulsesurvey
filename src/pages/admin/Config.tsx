
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ConfigSidebar } from "./config/components/ConfigSidebar";

export default function AdminConfig() {
  const navigate = useNavigate();
  
  return (
    <div>
      <div className="flex items-center mb-6">
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
      
      <SidebarProvider>
        <div className="flex min-h-[calc(100vh-8rem)] w-full gap-8 rounded-lg border bg-card p-4">
          <ConfigSidebar />
          <div className="flex-1 overflow-hidden px-4 py-2">
            {/* Configuration content will go here */}
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
