
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTopManagersComparison } from "../hooks/useTopManagersComparison";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupervisorPerformanceMetrics } from "./SupervisorPerformanceMetrics";
import { SupervisorPerformanceTable } from "./SupervisorPerformanceTable";
import { SupervisorPerformanceChartView } from "./SupervisorPerformanceChartView";
import { SupervisorPerformer, MetricSummary } from "../types/instance-comparison";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Download, BarChart3, TableIcon } from "lucide-react";

interface SupervisorPerformanceTabProps {
  campaignId?: string;
  baseInstanceId?: string;
  comparisonInstanceId?: string;
}

export function SupervisorPerformanceTab({ 
  campaignId, 
  baseInstanceId, 
  comparisonInstanceId 
}: SupervisorPerformanceTabProps) {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  
  useEffect(() => {
    console.log("SupervisorPerformanceTab mounted with:", { 
      campaignId, 
      baseInstanceId, 
      comparisonInstanceId 
    });
  }, [campaignId, baseInstanceId, comparisonInstanceId]);

  const { data: managersComparison, isLoading: isLoadingManagersComparison } = useTopManagersComparison(
    campaignId,
    baseInstanceId,
    comparisonInstanceId
  );

  const exportToCsv = () => {
    if (!managersComparison || managersComparison.length === 0) return;
    
    const headers = [
      "Manager",
      "Base Score",
      "Base Rank",
      "Comparison Score",
      "Comparison Rank",
      "Change",
      "Rank Change",
      "Average Score" // Add avg_score to export
    ];
    
    const csvContent = [
      headers.join(","),
      ...managersComparison.map(manager => [
        `"${manager.name}"`,
        manager.base_score.toFixed(2),
        manager.base_rank,
        manager.comparison_score.toFixed(2),
        manager.comparison_rank,
        manager.change.toFixed(2),
        manager.rank_change,
        manager.avg_score?.toFixed(2) || "N/A" // Include avg_score in export
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "supervisor_performance_comparison.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process data to categorize supervisors
  const processedData: SupervisorPerformer[] = managersComparison ? managersComparison.map(manager => ({
    ...manager,
    category: manager.change > 0.5 ? 'improved' : 
              manager.change < -0.5 ? 'declined' : 'stable'
  })) : [];

  // Calculate summary metrics
  const getMetrics = (): MetricSummary[] => {
    if (!processedData.length) return [];
    
    const improved = processedData.filter(m => m.category === 'improved').length;
    const declined = processedData.filter(m => m.category === 'declined').length;
    const stable = processedData.filter(m => m.category === 'stable').length;
    
    const topImprover = [...processedData].sort((a, b) => b.change - a.change)[0];
    const largestDrop = [...processedData].sort((a, b) => a.change - b.change)[0];
    
    // Use the avg_score from RPC when available, otherwise calculate
    const avgChange = processedData.reduce((sum, item) => sum + item.change, 0) / processedData.length;
    
    // Find the top performer by avg_score
    const topPerformer = [...processedData].sort((a, b) => {
      const scoreA = a.avg_score !== undefined ? a.avg_score : a.comparison_score;
      const scoreB = b.avg_score !== undefined ? b.avg_score : b.comparison_score;
      return scoreB - scoreA;
    })[0];
    
    return [
      {
        title: "Total Supervisors",
        value: processedData.length,
        description: "Supervisors analyzed",
        icon: <UserIcon className="h-5 w-5 text-blue-500" />
      },
      {
        title: "Improved Performance",
        value: improved,
        change: improved / processedData.length * 100,
        changeType: "positive" as const,
        description: "Supervisors with improved scores",
        icon: <TrendingUp className="h-5 w-5 text-green-500" />
      },
      {
        title: "Declined Performance",
        value: declined,
        change: declined / processedData.length * 100,
        changeType: "negative" as const,
        description: "Supervisors with declining scores",
        icon: <TrendingDown className="h-5 w-5 text-red-500" />
      },
      {
        title: "Average Change",
        value: avgChange.toFixed(2),
        changeType: avgChange > 0 ? "positive" as const : avgChange < 0 ? "negative" as const : "neutral" as const,
        description: "Average score change",
        icon: <AreaChart className="h-5 w-5 text-purple-500" />
      },
      {
        title: "Top Performer",
        value: topPerformer?.name || "N/A",
        change: topPerformer?.avg_score || topPerformer?.comparison_score || 0, // Use avg_score when available
        changeType: "positive" as const,
        description: `Score: ${(topPerformer?.avg_score || topPerformer?.comparison_score || 0).toFixed(2)}`,
        icon: <Trophy className="h-5 w-5 text-yellow-500" />
      }
    ];
  };

  if (isLoadingManagersComparison) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Supervisor Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[300px]">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!managersComparison || managersComparison.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Supervisor Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            No supervisor comparison data available.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Supervisor Performance Analysis</h2>
        <div className="flex items-center gap-2">
          <div className="border rounded-md p-1">
            <Button 
              variant={viewMode === 'table' ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setViewMode('table')}
              className="px-2"
            >
              <TableIcon className="h-4 w-4 mr-1" />
              Table
            </Button>
            <Button 
              variant={viewMode === 'chart' ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setViewMode('chart')}
              className="px-2"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Charts
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportToCsv}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      <SupervisorPerformanceMetrics metrics={getMetrics()} />

      {viewMode === 'table' ? (
        <SupervisorPerformanceTable data={processedData} />
      ) : (
        <SupervisorPerformanceChartView data={processedData} />
      )}
    </div>
  );
}

// Import necessary Lucide icons
import { UserIcon, TrendingUp, TrendingDown, AreaChart, Award, Trophy } from "lucide-react";
