
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { MetricsOverview } from "@/components/admin/dashboard/MetricsOverview";
import { ResponseTrendChart } from "@/components/admin/dashboard/analytics/ResponseTrendChart";
import { DepartmentCompletionChart } from "@/components/admin/dashboard/analytics/DepartmentCompletionChart";
import { TopSurveysTable } from "@/components/admin/dashboard/analytics/TopSurveysTable";
import { TopManagersTable } from "@/components/admin/dashboard/analytics/TopManagersTable";
import { TopSBUsTable } from "@/components/admin/dashboard/analytics/TopSBUsTable";
import { ManagersNeedingImprovement } from "@/components/admin/dashboard/analytics/ManagersNeedingImprovement";
import { DemographicBreakdown } from "@/components/admin/dashboard/analytics/DemographicBreakdown";
import { UpcomingSurveyDeadlines } from "@/components/admin/dashboard/analytics/UpcomingSurveyDeadlines";
import { SilentEmployees } from "@/components/admin/dashboard/analytics/SilentEmployees";
import { TourButton } from "@/components/onboarding/TourButton";
import { Tour } from "@/components/onboarding/Tour";

// Layout configurations for different components
const componentLayouts = {
  narrowList: "col-span-1",
  mediumWidth: "col-span-2",
  fullWidth: "col-span-3",
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
        <TourButton tourId="dashboard_overview" title="Dashboard Guide" />
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
          <div className="metrics-overview">
            <MetricsOverview />
          </div>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className={`${componentLayouts.mediumWidth} response-trends`}>
              <ResponseTrendChart />
            </div>
            <div className={`${componentLayouts.fullWidth} department-completion`}>
              <DepartmentCompletionChart />
            </div>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className={`${componentLayouts.narrowList} top-surveys`}>
              <TopSurveysTable />
            </div>
            <div className={`${componentLayouts.mediumWidth} top-sbus`}>
              <TopSBUsTable />
            </div>
            <div className={`${componentLayouts.fullWidth} top-managers`}>
              <TopManagersTable />
            </div>
          </div>
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className={`${componentLayouts.fullWidth} demographic-breakdown`}>
              <DemographicBreakdown />
            </div>
          </div>
        </TabsContent>

        {/* Needs Attention Tab */}
        <TabsContent value="attention" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className={`${componentLayouts.narrowList} upcoming-deadlines`}>
              <UpcomingSurveyDeadlines />
            </div>
            <div className={`${componentLayouts.mediumWidth} managers-improvement`}>
              <ManagersNeedingImprovement />
            </div>
            <div className={componentLayouts.fullWidth}>
              <SilentEmployees />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <Tour />
    </div>
  );
}
