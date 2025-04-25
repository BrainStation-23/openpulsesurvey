
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SBUPerformanceTab } from "./SBUPerformanceTab";
import { SupervisorPerformanceTab } from "./SupervisorPerformanceTab";
import { QuestionResponsesTab } from "./QuestionResponsesTab";
import { ComparisonState } from "../types/comparison-state";

interface ComparisonContentProps {
  comparison: ComparisonState;
  campaignId?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onConfirmComparison: () => void;
  onChangeSelection: () => void;
}

export function ComparisonContent({
  comparison,
  campaignId,
  activeTab,
  setActiveTab,
  onConfirmComparison,
  onChangeSelection
}: ComparisonContentProps) {
  switch (comparison.status) {
    case 'initial':
      return (
        <div className="text-center py-8">
          <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Select Instances to Compare</h3>
          <p className="text-muted-foreground mb-4">
            Please select two different periods to see a comparison of performance data.
          </p>
        </div>
      );

    case 'invalid':
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Invalid Selection</AlertTitle>
          <AlertDescription>
            {comparison.errorMessage || 'Please select two different instances to compare.'}
          </AlertDescription>
        </Alert>
      );

    case 'selecting':
      return (
        <div className="text-center py-8">
          <Button 
            onClick={onConfirmComparison} 
            disabled={!comparison.baseInstanceId || !comparison.comparisonInstanceId}
            className="mt-4"
            size="lg"
          >
            Compare Selected Instances
          </Button>
        </div>
      );

    case 'ready':
      return (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={onChangeSelection}>
              Change Selection
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="sbu">SBU Performance</TabsTrigger>
              <TabsTrigger value="supervisors">Supervisor Performance</TabsTrigger>
              <TabsTrigger value="questions">Question Responses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sbu">
              <SBUPerformanceTab 
                campaignId={campaignId}
                baseInstanceId={comparison.baseInstanceId}
                comparisonInstanceId={comparison.comparisonInstanceId}
              />
            </TabsContent>
            
            <TabsContent value="supervisors">
              <SupervisorPerformanceTab 
                campaignId={campaignId}
                baseInstanceId={comparison.baseInstanceId}
                comparisonInstanceId={comparison.comparisonInstanceId}
              />
            </TabsContent>
            
            <TabsContent value="questions">
              <QuestionResponsesTab 
                campaignId={campaignId}
                baseInstanceId={comparison.baseInstanceId}
                comparisonInstanceId={comparison.comparisonInstanceId}
              />
            </TabsContent>
          </Tabs>
        </div>
      );
  }
}
