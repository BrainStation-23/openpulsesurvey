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
  
  const [comparison, setComparison] = useState<ComparisonState>({
    baseInstanceId: undefined,
    comparisonInstanceId: undefined,
    status: 'initial'
  });
  
  const { 
    suggestedBase, 
    suggestedComparison, 
    isLoading,
    instances 
  } = useInstancesForComparison(campaignId || '');
  
  useEffect(() => {
    if (!isLoading && suggestedBase && suggestedComparison && comparison.status === 'initial') {
      if (suggestedBase.id !== suggestedComparison.id) {
        setComparison({
          baseInstanceId: suggestedBase.id,
          comparisonInstanceId: suggestedComparison.id,
          status: 'selecting'
        });
      }
    }
  }, [suggestedBase, suggestedComparison, isLoading, comparison.status]);
  
  const handleBaseInstanceSelect = (instanceId: string) => {
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
  
  const handleSwapInstances = () => {
    if (comparison.baseInstanceId && comparison.comparisonInstanceId) {
      const tempBaseId = comparison.baseInstanceId;
      const tempComparisonId = comparison.comparisonInstanceId;
      
      setComparison({
        baseInstanceId: tempComparisonId,
        comparisonInstanceId: tempBaseId,
        status: comparison.status,
        errorMessage: undefined
      });
    }
  };
  
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

  const handleConfirmComparison = () => {
    if (comparison.baseInstanceId && comparison.comparisonInstanceId) {
      setComparison({
        ...comparison,
        status: 'ready'
      });
    }
  };
  
  const handleChangeSelection = () => {
    setComparison({
      ...comparison,
      status: 'selecting'
    });
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
            onSwapInstances={handleSwapInstances}
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
