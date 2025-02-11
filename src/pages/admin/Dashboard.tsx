
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricsOverview } from "@/components/admin/dashboard/MetricsOverview";
import { RecentActivity } from "@/components/admin/dashboard/RecentActivity";
import { ResponseTrendChart } from "@/components/admin/dashboard/analytics/ResponseTrendChart";
import { DepartmentCompletionChart } from "@/components/admin/dashboard/analytics/DepartmentCompletionChart";
import { TopSurveysTable } from "@/components/admin/dashboard/analytics/TopSurveysTable";
import { TopManagersTable } from "@/components/admin/dashboard/analytics/TopManagersTable";
import { TopSBUsTable } from "@/components/admin/dashboard/analytics/TopSBUsTable";
import { ManagersNeedingImprovement } from "@/components/admin/dashboard/analytics/ManagersNeedingImprovement";
import { DemographicBreakdown } from "@/components/admin/dashboard/analytics/DemographicBreakdown";
import { UpcomingSurveyDeadlines } from "@/components/admin/dashboard/analytics/UpcomingSurveyDeadlines";
import { SilentEmployees } from "@/components/admin/dashboard/analytics/SilentEmployees";

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
      </div>
      
      <MetricsOverview />
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="attention">Needs Attention</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-1">
            <ResponseTrendChart />
          </div>
          <div className="grid gap-6 md:grid-cols-1">
            <DepartmentCompletionChart />
          </div>
          <div className="grid gap-6 md:grid-cols-1">
            <RecentActivity />
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-1">
            <TopManagersTable />
          </div>
          <div className="grid gap-6 md:grid-cols-1">
            <TopSBUsTable />
          </div>
          <div className="grid gap-6 md:grid-cols-1">
            <TopSurveysTable />
          </div>
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-6">
          <DemographicBreakdown />
        </TabsContent>

        {/* Needs Attention Tab */}
        <TabsContent value="attention" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-1">
            <SilentEmployees />
          </div>
          <div className="grid gap-6 md:grid-cols-1">
            <ManagersNeedingImprovement />
          </div>
          <div className="grid gap-6 md:grid-cols-1">
            <UpcomingSurveyDeadlines />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
