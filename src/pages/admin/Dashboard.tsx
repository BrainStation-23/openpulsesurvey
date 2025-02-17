
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
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

// Layout configurations for different components
const componentLayouts = {
  narrowList: "col-span-1", // Components that work well in narrow spaces (1/3 width)
  mediumWidth: "col-span-2", // Components that need medium width (2/3 width)
  fullWidth: "col-span-3", // Components that need full width
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
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
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="attention">Needs Attention</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <MetricsOverview />
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className={componentLayouts.narrowList}>
              <RecentActivity />
            </div>
            <div className={componentLayouts.mediumWidth}>
              <ResponseTrendChart />
            </div>
            <div className={componentLayouts.fullWidth}>
              <DepartmentCompletionChart />
            </div>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className={componentLayouts.narrowList}>
              <TopSurveysTable />
            </div>
            <div className={componentLayouts.mediumWidth}>
              <TopSBUsTable />
            </div>
            <div className={componentLayouts.fullWidth}>
              <TopManagersTable />
            </div>
          </div>
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className={componentLayouts.fullWidth}>
              <DemographicBreakdown />
            </div>
          </div>
        </TabsContent>

        {/* Needs Attention Tab */}
        <TabsContent value="attention" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className={componentLayouts.narrowList}>
              <UpcomingSurveyDeadlines />
            </div>
            <div className={componentLayouts.mediumWidth}>
              <ManagersNeedingImprovement />
            </div>
            <div className={componentLayouts.fullWidth}>
              <SilentEmployees />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
