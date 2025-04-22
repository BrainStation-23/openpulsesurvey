import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Award, Medal, Trophy, UserCircle, Search, ChevronUp, ChevronDown } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useManagersTable } from "@/hooks/useManagersTable";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface TopPerformingManagersChartProps {
  campaignId: string;
  instanceId?: string;
}

type ManagerPerformance = {
  rank: number;
  supervisor_name: string;
  sbu_name: string;
  total_assigned: number;
  total_completed: number;
  avg_score: number;
  completion_rate: number;
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Medal className="h-5 w-5 text-amber-600" />;
    default:
      return <Award className="h-5 w-5 text-blue-500" />;
  }
};

export function TopPerformingManagersChart({ campaignId, instanceId }: TopPerformingManagersChartProps) {
  const { data: managerPerformance, isLoading } = useQuery({
    queryKey: ["manager-performance", campaignId, instanceId],
    queryFn: async () => {
      if (!instanceId) return [];

      // Use the supabase rpc function with proper types
      const { data, error } = await supabase.rpc(
        'get_campaign_supervisor_performance',
        {
          p_campaign_id: campaignId,
          p_instance_id: instanceId
        }
      );

      if (error) {
        console.error("Error fetching manager performance:", error);
        throw error;
      }

      return data as ManagerPerformance[];
    },
    enabled: !!campaignId && !!instanceId,
  });

  const {
    paginatedData,
    totalPages,
    currentPage,
    pageSize,
    searchQuery,
    sortConfig,
    setSearchQuery,
    setCurrentPage,
    setPageSize,
    handleSort,
  } = useManagersTable(managerPerformance || []);

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-yellow-500" />
            Top Performing Managers
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!managerPerformance || managerPerformance.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-yellow-500" />
            Top Performing Managers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No data available for manager performance.
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-yellow-500" />
          Top Performing Managers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search managers or departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              className="border rounded p-2"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">
                  <Button
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={() => handleSort("base_rank")}
                  >
                    Rank
                    {renderSortIcon("base_rank")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={() => handleSort("supervisor_name")}
                  >
                    Manager
                    {renderSortIcon("supervisor_name")}
                  </Button>
                </TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Assigned</TableHead>
                <TableHead className="text-right">Completed</TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={() => handleSort("avg_score")}
                  >
                    Avg Score
                    {renderSortIcon("avg_score")}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={() => handleSort("completion_rate")}
                  >
                    Completion Rate
                    {renderSortIcon("completion_rate")}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((manager) => (
                <TableRow key={`${manager.supervisor_name}-${manager.rank}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getRankIcon(manager.rank)}
                      #{manager.rank}
                    </div>
                  </TableCell>
                  <TableCell>{manager.supervisor_name}</TableCell>
                  <TableCell>{manager.sbu_name}</TableCell>
                  <TableCell className="text-right">{manager.total_assigned}</TableCell>
                  <TableCell className="text-right">{manager.total_completed}</TableCell>
                  <TableCell className="text-right font-medium">
                    {manager.avg_score?.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {manager.completion_rate?.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, (managerPerformance || []).length)} of {(managerPerformance || []).length} entries
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
