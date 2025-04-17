
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedDualInstanceSelector } from "./components/EnhancedDualInstanceSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SBUPerformanceTab } from "./components/SBUPerformanceTab";
import { SupervisorPerformanceTab } from "./components/SupervisorPerformanceTab";
import { QuestionResponsesTab } from "./components/QuestionResponsesTab";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";
import { ComparisonSelectionStatus, ComparisonState } from "./types/comparison-state";
import { useInstancesForComparison } from "./hooks/useInstancesForComparison";
import { Button } from "@/components/ui/button";

export function InstanceCompareTab() {
  const { id: campaignId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("sbu");
  
  // Comparison state management
  const [comparison, setComparison] = useState<ComparisonState>({
    baseInstanceId: undefined,
    comparisonInstanceId: undefined,
    status: 'initial'
  });
  
  // Get suggested instances for comparison (will automatically handle logic for smart defaults)
  const { 
    suggestedBase, 
    suggestedComparison, 
    isLoading,
    instances 
  } = useInstancesForComparison(campaignId || '');
  
  // Set initial suggested instances once loaded
  useEffect(() => {
    if (!isLoading && suggestedBase && suggestedComparison && comparison.status === 'initial') {
      setComparison({
        baseInstanceId: suggestedBase.id,
        comparisonInstanceId: suggestedComparison.id,
        status: 'selecting' // We now have suggestions but user hasn't confirmed
      });
    }
  }, [suggestedBase, suggestedComparison, isLoading, comparison.status]);
  
  // Handle instance selection
  const handleBaseInstanceSelect = (instanceId: string) => {
    // If selecting the same as comparison, show warning
    if (instanceId === comparison.comparisonInstanceId) {
      setComparison({
        ...comparison,
        baseInstanceId: instanceId,
        status: 'invalid',
        errorMessage: 'Base and comparison instances cannot be the same'
      });
    } else {
      setComparison({
        ...comparison,
        baseInstanceId: instanceId,
        status: comparison.comparisonInstanceId ? 'selecting' : 'initial',
        errorMessage: undefined
      });
    }
  };
  
  const handleComparisonInstanceSelect = (instanceId: string) => {
    // If selecting the same as base, show warning
    if (instanceId === comparison.baseInstanceId) {
      setComparison({
        ...comparison,
        comparisonInstanceId: instanceId,
        status: 'invalid',
        errorMessage: 'Base and comparison instances cannot be the same'
      });
    } else {
      setComparison({
        ...comparison,
        comparisonInstanceId: instanceId,
        status: comparison.baseInstanceId ? 'selecting' : 'initial',
        errorMessage: undefined
      });
    }
  };
  
  // Handle comparison confirmation
  const handleConfirmComparison = () => {
    if (comparison.baseInstanceId && comparison.comparisonInstanceId) {
      setComparison({
        ...comparison,
        status: 'ready'
      });
    }
  };
  
  // Reset comparison to selecting state
  const handleChangeSelection = () => {
    setComparison({
      ...comparison,
      status: 'selecting'
    });
  };

  // Generate appropriate UI based on comparison state
  const renderComparisonContent = () => {
    switch (comparison.status) {
      case 'initial':
        return (
          <div className="text-center py-8">
            <Info className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Select Instances to Compare</h3>
            <p className="text-muted-foreground mb-4">
              Please select two different periods to see a comparison of performance data.
            </p>
            {isLoading && <p className="text-sm">Loading suggested instances...</p>}
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
              onClick={handleConfirmComparison} 
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
              <Button variant="outline" size="sm" onClick={handleChangeSelection}>
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
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compare Instances</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedDualInstanceSelector
            campaignId={campaignId || ''}
            baseInstanceId={comparison.baseInstanceId}
            comparisonInstanceId={comparison.comparisonInstanceId}
            onBaseInstanceSelect={handleBaseInstanceSelect}
            onComparisonInstanceSelect={handleComparisonInstanceSelect}
            disableSameSelection={true}
            instancesData={instances}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {renderComparisonContent()}
    </div>
  );
}
