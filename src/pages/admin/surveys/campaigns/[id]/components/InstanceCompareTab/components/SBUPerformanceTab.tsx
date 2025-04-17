
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTopSBUComparison } from "../hooks/useTopSBUComparison";
import { format } from "date-fns";
import { 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  BarChart3, 
  Table as TableIcon,
  Download, 
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  TrophyIcon,
  Medal
} from "lucide-react";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine
} from "recharts";
import { SBUPerformanceData, TopSBUPerformer } from "../types/instance-comparison";
import { SBUPerformanceMetrics } from "./SBUPerformanceMetrics";
import { SBUPerformanceChartView } from "./SBUPerformanceChartView";

interface SBUPerformanceTabProps {
  campaignId?: string;
  baseInstanceId?: string;
  comparisonInstanceId?: string;
}

export function SBUPerformanceTab({ 
  campaignId, 
  baseInstanceId, 
  comparisonInstanceId 
}: SBUPerformanceTabProps) {
  const [viewMode, setViewMode] = useState<"table" | "chart">("table");
  
  const { data: sbuComparison, isLoading: isLoadingSBUComparison } = useTopSBUComparison(
    campaignId,
    baseInstanceId,
    comparisonInstanceId
  );

  // Prepare data for charts and performance categories
  const performanceData: SBUPerformanceData[] = sbuComparison?.map(sbu => ({
    sbu: sbu.name,
    baseScore: sbu.baseScore,
    comparisonScore: sbu.comparisonScore,
    change: sbu.comparisonScore - sbu.baseScore,
    category: getPerformanceCategory(sbu.comparisonScore - sbu.baseScore),
    baseRank: sbu.baseRank, 
    comparisonRank: sbu.comparisonRank,
    rankChange: sbu.baseRank - sbu.comparisonRank
  })) || [];

  // Helper to get performance category
  function getPerformanceCategory(change: number): "improved" | "declined" | "unchanged" {
    if (change > 0.1) return "improved";
    if (change < -0.1) return "declined";
    return "unchanged";
  }

  // Export to CSV
  const exportToCSV = () => {
    if (!sbuComparison?.length) return;
    
    const headers = [
      "SBU Name",
      "Base Score",
      "Base Rank",
      "Comparison Score",
      "Comparison Rank",
      "Score Change",
      "Rank Change"
    ];
    
    const rows = sbuComparison.map(sbu => [
      sbu.name,
      sbu.baseScore.toFixed(2),
      sbu.baseRank,
      sbu.comparisonScore.toFixed(2),
      sbu.comparisonRank,
      (sbu.comparisonScore - sbu.baseScore).toFixed(2),
      (sbu.baseRank - sbu.comparisonRank)
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sbu_performance_comparison.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>SBU Performance Comparison</CardTitle>
            <CardDescription>
              Compare SBU performance between two periods
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <div className="rounded-md border">
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-l-md ${viewMode === 'table' ? 'bg-muted' : ''}`}
                onClick={() => setViewMode('table')}
              >
                <TableIcon className="h-4 w-4 mr-2" />
                Table
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-r-md ${viewMode === 'chart' ? 'bg-muted' : ''}`}
                onClick={() => setViewMode('chart')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Charts
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportToCSV} 
              disabled={isLoadingSBUComparison || !sbuComparison?.length}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingSBUComparison ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Loading comparison data...</p>
              </div>
            </div>
          ) : !sbuComparison || sbuComparison.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <BarChart3 className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No SBU performance data</h3>
              <p className="text-sm text-muted-foreground max-w-md mt-2">
                There is no comparison data available for the selected instances. Try selecting different instances to compare.
              </p>
            </div>
          ) : (
            <>
              {/* Performance Metrics Summary Cards */}
              <SBUPerformanceMetrics data={performanceData} />
              
              {/* Main Content Based on View Mode */}
              {viewMode === "table" ? (
                <div className="overflow-x-auto mt-6">
                  <ResponsiveTable>
                    <ResponsiveTable.Header>
                      <ResponsiveTable.Row>
                        <ResponsiveTable.Head className="w-8 text-center">Rank</ResponsiveTable.Head>
                        <ResponsiveTable.Head>SBU</ResponsiveTable.Head>
                        <ResponsiveTable.Head className="text-right">Base Score</ResponsiveTable.Head>
                        <ResponsiveTable.Head className="text-right">Base Rank</ResponsiveTable.Head>
                        <ResponsiveTable.Head className="text-right">Comparison Score</ResponsiveTable.Head>
                        <ResponsiveTable.Head className="text-right">Comparison Rank</ResponsiveTable.Head>
                        <ResponsiveTable.Head className="text-right">Score Change</ResponsiveTable.Head>
                        <ResponsiveTable.Head className="text-right">Rank Change</ResponsiveTable.Head>
                      </ResponsiveTable.Row>
                    </ResponsiveTable.Header>
                    <ResponsiveTable.Body>
                      {sbuComparison.map((sbu, index) => {
                        const isSignificantChange = Math.abs(sbu.change) > 0.4;
                        const scoreChange = sbu.comparisonScore - sbu.baseScore;
                        const rankChange = sbu.baseRank - sbu.comparisonRank;
                        
                        return (
                          <ResponsiveTable.Row key={sbu.name} className="border-b hover:bg-muted/50">
                            <ResponsiveTable.Cell className="text-center font-medium">
                              {sbu.comparisonRank === 1 ? (
                                <div className="flex justify-center">
                                  <TrophyIcon className="h-5 w-5 text-yellow-500" />
                                </div>
                              ) : sbu.comparisonRank === 2 ? (
                                <div className="flex justify-center">
                                  <Medal className="h-5 w-5 text-gray-400" />
                                </div>
                              ) : sbu.comparisonRank === 3 ? (
                                <div className="flex justify-center">
                                  <Medal className="h-5 w-5 text-amber-600" />
                                </div>
                              ) : (
                                sbu.comparisonRank
                              )}
                            </ResponsiveTable.Cell>
                            <ResponsiveTable.Cell className="font-medium">
                              {sbu.name}
                            </ResponsiveTable.Cell>
                            <ResponsiveTable.Cell className="text-right">
                              {sbu.baseScore.toFixed(2)}
                            </ResponsiveTable.Cell>
                            <ResponsiveTable.Cell className="text-right">
                              {sbu.baseRank}
                            </ResponsiveTable.Cell>
                            <ResponsiveTable.Cell className="text-right">
                              {sbu.comparisonScore.toFixed(2)}
                            </ResponsiveTable.Cell>
                            <ResponsiveTable.Cell className="text-right">
                              {sbu.comparisonRank}
                            </ResponsiveTable.Cell>
                            <ResponsiveTable.Cell className="text-right">
                              <div className="flex items-center justify-end space-x-1">
                                {scoreChange > 0 ? (
                                  <TrendingUp className={`h-4 w-4 ${isSignificantChange ? 'text-green-500' : 'text-muted-foreground'}`} />
                                ) : scoreChange < 0 ? (
                                  <TrendingDown className={`h-4 w-4 ${isSignificantChange ? 'text-red-500' : 'text-muted-foreground'}`} />
                                ) : (
                                  <Minus className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className={`
                                  ${scoreChange > 0 
                                    ? isSignificantChange ? 'text-green-500' : 'text-muted-foreground'
                                    : scoreChange < 0
                                    ? isSignificantChange ? 'text-red-500' : 'text-muted-foreground'
                                    : 'text-muted-foreground'
                                  }
                                `}>
                                  {scoreChange > 0 ? '+' : ''}{scoreChange.toFixed(2)}
                                </span>
                              </div>
                            </ResponsiveTable.Cell>
                            <ResponsiveTable.Cell className="text-right">
                              <div className="flex items-center justify-end space-x-1">
                                {rankChange > 0 ? (
                                  <ArrowUp className="h-4 w-4 text-green-500" />
                                ) : rankChange < 0 ? (
                                  <ArrowDown className="h-4 w-4 text-red-500" />
                                ) : (
                                  <Minus className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className={`
                                  ${rankChange > 0 
                                    ? 'text-green-500' 
                                    : rankChange < 0 
                                    ? 'text-red-500' 
                                    : 'text-muted-foreground'
                                  }
                                `}>
                                  {rankChange > 0 ? '+' : ''}{rankChange}
                                </span>
                              </div>
                            </ResponsiveTable.Cell>
                          </ResponsiveTable.Row>
                        );
                      })}
                    </ResponsiveTable.Body>
                  </ResponsiveTable>
                </div>
              ) : (
                <SBUPerformanceChartView data={performanceData} />
              )}

              <div className="mt-4 text-xs text-muted-foreground">
                <p>Showing data for {sbuComparison.length} SBUs. Performance is measured on a scale from 0 to 5.</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
