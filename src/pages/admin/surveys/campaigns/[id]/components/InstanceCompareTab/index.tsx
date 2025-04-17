
import { useState } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, Building2, LayoutDashboard, PercentCircle, Trophy, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ComparisonLayout } from "../PresentationView/components/ComparisonLayout";
import { DualInstanceSelector } from "./components/DualInstanceSelector";
import { ComparisonSummaryCard } from "./components/ComparisonSummaryCard";
import { DepartmentStatusTable } from "./components/DepartmentStatusTable";
import { TopPerformersComparisonTable } from "./components/TopPerformersComparisonTable";
import { useInstanceComparison } from "./hooks/useInstanceComparison";
import { useDepartmentComparison } from "./hooks/useDepartmentComparison";
import { useTopSBUComparison } from "./hooks/useTopSBUComparison";
import { useTopManagersComparison } from "./hooks/useTopManagersComparison";

export function InstanceCompareTab() {
  const { id: campaignId } = useParams<{ id: string }>();
  const [baseInstanceId, setBaseInstanceId] = useState<string>();
  const [comparisonInstanceId, setComparisonInstanceId] = useState<string>();

  const { data: comparisonData, isLoading: isLoadingComparison } = useInstanceComparison(
    baseInstanceId, 
    comparisonInstanceId
  );

  const { data: departmentData = [], isLoading: isLoadingDepartments } = useDepartmentComparison(
    baseInstanceId,
    comparisonInstanceId
  );

  const { data: topSBUs = [], isLoading: isLoadingTopSBUs } = useTopSBUComparison(
    baseInstanceId,
    comparisonInstanceId
  );

  const { data: topManagers = [], isLoading: isLoadingTopManagers } = useTopManagersComparison(
    baseInstanceId,
    comparisonInstanceId
  );

  if (!baseInstanceId || !comparisonInstanceId) {
    return (
      <ComparisonLayout title="Campaign Instance Comparison">
        <div className="mb-8">
          <DualInstanceSelector
            campaignId={campaignId || ""}
            baseInstanceId={baseInstanceId}
            comparisonInstanceId={comparisonInstanceId}
            onBaseInstanceSelect={setBaseInstanceId}
            onComparisonInstanceSelect={setComparisonInstanceId}
          />
        </div>
        
        <Alert>
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Select instances to compare</AlertTitle>
          <AlertDescription>
            Please select two different campaign instances to view a comparison of their performance metrics.
          </AlertDescription>
        </Alert>
      </ComparisonLayout>
    );
  }

  if (isLoadingComparison) {
    return (
      <ComparisonLayout title="Campaign Instance Comparison">
        <div className="mb-8">
          <DualInstanceSelector
            campaignId={campaignId || ""}
            baseInstanceId={baseInstanceId}
            comparisonInstanceId={comparisonInstanceId}
            onBaseInstanceSelect={setBaseInstanceId}
            onComparisonInstanceSelect={setComparisonInstanceId}
          />
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading comparison data...</p>
          </div>
        </div>
      </ComparisonLayout>
    );
  }

  return (
    <ComparisonLayout title="Campaign Instance Comparison">
      <div className="mb-8">
        <DualInstanceSelector
          campaignId={campaignId || ""}
          baseInstanceId={baseInstanceId}
          comparisonInstanceId={comparisonInstanceId}
          onBaseInstanceSelect={setBaseInstanceId}
          onComparisonInstanceSelect={setComparisonInstanceId}
        />
      </div>

      {comparisonData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <ComparisonSummaryCard
              title="Completion Rate"
              icon={<PercentCircle className="h-4 w-4 text-blue-500" />}
              baseValue={comparisonData.baseInstance.completion_rate || 0}
              comparisonValue={comparisonData.comparisonInstance.completion_rate || 0}
              format="percent"
              loading={isLoadingComparison}
            />
            
            <ComparisonSummaryCard
              title="Total Responses"
              icon={<LayoutDashboard className="h-4 w-4 text-indigo-500" />}
              baseValue={comparisonData.baseInstance.total_responses || 0}
              comparisonValue={comparisonData.comparisonInstance.total_responses || 0}
              format="number"
              loading={isLoadingComparison}
            />
            
            <ComparisonSummaryCard
              title="Unique Respondents"
              icon={<Users className="h-4 w-4 text-emerald-500" />}
              baseValue={comparisonData.baseInstance.unique_respondents || 0}
              comparisonValue={comparisonData.comparisonInstance.unique_respondents || 0}
              format="number"
              loading={isLoadingComparison}
            />
            
            <ComparisonSummaryCard
              title="Average Rating"
              icon={<PercentCircle className="h-4 w-4 text-amber-500" />}
              baseValue={comparisonData.baseInstance.avg_rating || 0}
              comparisonValue={comparisonData.comparisonInstance.avg_rating || 0}
              format="number"
              loading={isLoadingComparison}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <DepartmentStatusTable 
              departmentData={departmentData} 
              loading={isLoadingDepartments} 
            />
            
            <TopPerformersComparisonTable
              title="Top Performing SBUs"
              icon={<Building2 className="h-5 w-5 text-blue-500" />}
              performers={topSBUs}
              loading={isLoadingTopSBUs}
            />
          </div>
          
          <div className="mb-8">
            <TopPerformersComparisonTable
              title="Top Performing Managers"
              icon={<Trophy className="h-5 w-5 text-yellow-500" />}
              performers={topManagers}
              loading={isLoadingTopManagers}
            />
          </div>
        </>
      )}
    </ComparisonLayout>
  );
}
