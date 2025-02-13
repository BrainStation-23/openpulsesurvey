
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, PieChart, Users, ClipboardList, Activity, FileBarChart } from "lucide-react";

export function TabPanel({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <TabsContent value={value} className="space-y-4">
      {children}
    </TabsContent>
  );
}

interface CampaignTabsProps {
  children: React.ReactNode;
  isAnonymous?: boolean;
}

export function CampaignTabs({ children, isAnonymous }: CampaignTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview" className="gap-2">
          <PieChart className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="assignments" className="gap-2">
          <Users className="h-4 w-4" />
          Assignments
        </TabsTrigger>
        {<TabsTrigger value="responses" className="gap-2">
          <ClipboardList className="h-4 w-4" />
          Responses
        </TabsTrigger>}
        <TabsTrigger value="activity" className="gap-2">
          <Activity className="h-4 w-4" />
          Activity
        </TabsTrigger>
        <TabsTrigger value="reports" className="gap-2">
          <FileBarChart className="h-4 w-4" />
          Reports
        </TabsTrigger>
        <TabsTrigger value="analyze" className="gap-2">
          <Brain className="h-4 w-4" />
          AI-nalyze
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
