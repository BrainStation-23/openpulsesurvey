
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { IssueBoard } from "./types";

export default function AdminIssueBoards() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleCreate = () => {
    navigate("/admin/surveys/issue-boards/create");
  };

  const handleEdit = (board: IssueBoard) => {
    navigate(`/admin/surveys/issue-boards/${board.id}`);
  };

  const handleView = (board: IssueBoard) => {
    navigate(`/admin/surveys/issue-boards/${board.id}/view`);
  };

  const handleDelete = (id: string) => {
    deleteBoardMutation.mutate(id);
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
    {
      id: "actions",
      cell: ({ row }) => {
        const board = row.original;
        return (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleView(board)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(board)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Board</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {board.name}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(board.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

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

  const deleteBoardMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('issue_boards')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueBoards'] });
      toast({
        title: "Success",
        description: "Board deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to delete board: " + error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Survey Issue Boards</h1>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleCreate}>
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
