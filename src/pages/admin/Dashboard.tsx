import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MetricsOverview } from "@/components/admin/dashboard/MetricsOverview";
import { RecentActivity } from "@/components/admin/dashboard/RecentActivity";
import { ResponseTrendChart } from "@/components/admin/dashboard/analytics/ResponseTrendChart";
import { DepartmentCompletionChart } from "@/components/admin/dashboard/analytics/DepartmentCompletionChart";
import { TopSurveysTable } from "@/components/admin/dashboard/analytics/TopSurveysTable";
import { DemographicBreakdown } from "@/components/admin/dashboard/analytics/DemographicBreakdown";
import { UpcomingSurveyDeadlines } from "@/components/admin/dashboard/analytics/UpcomingSurveyDeadlines";

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
      
      <div className="grid gap-6 md:grid-cols-2">
        <ResponseTrendChart />
        <DepartmentCompletionChart />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <TopSurveysTable />
        <UpcomingSurveyDeadlines />
      </div>

      <RecentActivity />
      
      <DemographicBreakdown />
    </div>
  );
}