import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, PieChart, Users, ClipboardList, FileBarChart, Lock, GitCompare, LineChart } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

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
  status?: string;
}

export function CampaignTabs({ children, isAnonymous, status }: CampaignTabsProps) {
  const isDraft = status === 'draft';
  const [currentTab, setCurrentTab] = useState<string>(isDraft ? "assignments" : "overview");

  useEffect(() => {
    setCurrentTab(isDraft ? "assignments" : "overview");
  }, [isDraft]);

  const disabledTabs = isDraft ? ["overview", "responses", "reports", "compare", "analyze"] : [];

  const renderTabTrigger = (value: string, label: string, icon: React.ReactNode) => {
    const isDisabled = disabledTabs.includes(value);

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <TabsTrigger 
                value={value} 
                className={`gap-2 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isDisabled}
              >
                {icon}
                {label}
                {isDisabled && <Lock className="h-3 w-3 ml-1" />}
              </TabsTrigger>
            </div>
          </TooltipTrigger>
          {isDisabled && (
            <TooltipContent>
              <p>This feature is only available after publishing the campaign</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="space-y-4">
      {isDraft && (
        <Alert>
          <AlertDescription>
            This campaign is in draft mode. Only the Assignments tab is available. Publish the campaign to access all features.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={currentTab} defaultValue={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList>
          {renderTabTrigger("overview", "Overview", <PieChart className="h-4 w-4" />)}
          {renderTabTrigger("assignments", "Assignments", <Users className="h-4 w-4" />)}
          {renderTabTrigger("responses", "Responses", <ClipboardList className="h-4 w-4" />)}
          {renderTabTrigger("reports", "Reports", <FileBarChart className="h-4 w-4" />)}
          {renderTabTrigger("compare", "Compare", <GitCompare className="h-4 w-4" />)}
          {renderTabTrigger("trends", "Response Trends", <LineChart className="h-4 w-4" />)}
          {renderTabTrigger("analyze", "AI-nalyze", <Brain className="h-4 w-4" />)}
        </TabsList>
        {children}
      </Tabs>
    </div>
  );
}
