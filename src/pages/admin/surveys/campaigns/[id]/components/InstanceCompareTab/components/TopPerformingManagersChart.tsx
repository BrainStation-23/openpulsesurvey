import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TablePagination } from "@/pages/admin/users/components/UserTable/TablePagination";
import { ManagerTableHeader } from "./ManagerTableHeader";
import { useManagerTable } from "../hooks/useManagerTable";
import { UserCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
    setCurrentPage,
    pageSize,
    setPageSize,
    searchTerm,
    setSearchTerm,
    sortConfig,
    handleSort,
    totalItems
  } = useManagerTable<ManagerPerformance>(managerPerformance || [], 10);

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
          <div className="flex items-center justify-between gap-4">
            <Input
              placeholder="Search managers or departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <ManagerTableHeader onSort={handleSort} sortConfig={sortConfig} />
              <TableBody>
                {paginatedData.map((manager) => (
                  <TableRow key={`${manager.supervisor_name}-${manager.rank}`}>
                    <TableCell className="font-medium">
                      #{manager.rank}
                    </TableCell>
                    <TableCell>{manager.supervisor_name}</TableCell>
                    <TableCell>{manager.sbu_name}</TableCell>
                    <TableCell className="text-right">{manager.total_assigned}</TableCell>
                    <TableCell className="text-right">{manager.total_completed}</TableCell>
                    <TableCell className="text-right font-medium">
                      {manager.avg_score.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {manager.completion_rate.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {paginatedData.length} of {totalItems} managers
            </p>
            <TablePagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
