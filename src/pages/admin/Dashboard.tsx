import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MetricsOverview } from "@/components/admin/dashboard/MetricsOverview";
import { RecentActivity } from "@/components/admin/dashboard/RecentActivity";

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      
      <MetricsOverview />
      
      <div className="grid gap-4 md:grid-cols-2">
        <RecentActivity />
        {/* More sections will be added in future phases */}
      </div>
    </div>
  );
}