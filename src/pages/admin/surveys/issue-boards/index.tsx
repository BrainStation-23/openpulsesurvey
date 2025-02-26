
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ColumnDef } from "@tanstack/react-table";

type IssueBoard = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  status: 'active' | 'archived';
};

const columns: ColumnDef<IssueBoard>[] = [
  {
    accessorKey: "name",
    header: "Board Name",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => row.original.description || "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className={`capitalize ${row.original.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
        {row.original.status}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
];

export default function AdminIssueBoards() {
  const { data: issueBoards, isLoading } = useQuery({
    queryKey: ['issueBoards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issue_boards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as IssueBoard[];
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Survey Issue Boards</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Board
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <DataTable 
          columns={columns} 
          data={issueBoards || []} 
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
}
