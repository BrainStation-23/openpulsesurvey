import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Pencil, Trash2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ColumnDef } from "@tanstack/react-table";
import { IssueBoardDialog } from "./components/IssueBoardDialog";
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
import { BoardPermissionsDialog } from "./components/BoardPermissionsDialog";
import type { IssueBoardPermission } from "./types";

export default function AdminIssueBoards() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedBoard, setSelectedBoard] = React.useState<IssueBoard | null>(null);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = React.useState(false);
  const [selectedBoardForPermissions, setSelectedBoardForPermissions] = React.useState<IssueBoard | null>(null);
  const queryClient = useQueryClient();

  const handleCreate = () => {
    setSelectedBoard(null);
    setDialogOpen(true);
  };

  const handleEdit = (board: IssueBoard) => {
    setSelectedBoard(board);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteBoardMutation.mutate(id);
  };

  const handlePermissions = (board: IssueBoard) => {
    setSelectedBoardForPermissions(board);
    setPermissionsDialogOpen(true);
  };

  const handlePermissionsSubmit = (permissions: Partial<IssueBoardPermission>[]) => {
    updatePermissionsMutation.mutate(permissions);
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
              onClick={() => handlePermissions(board)}
            >
              <Lock className="h-4 w-4" />
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

  const createBoardMutation = useMutation({
    mutationFn: async (values: Pick<IssueBoard, 'name' | 'description' | 'status'>) => {
      const user = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('issue_boards')
        .insert({
          name: values.name,
          description: values.description,
          status: values.status || 'active',
          created_by: user.data.user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueBoards'] });
      toast({
        title: "Success",
        description: "Board created successfully",
      });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create board: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateBoardMutation = useMutation({
    mutationFn: async (values: Pick<IssueBoard, 'name' | 'description' | 'status'>) => {
      const { data, error } = await supabase
        .from('issue_boards')
        .update({
          name: values.name,
          description: values.description,
          status: values.status || 'active',
        })
        .eq('id', selectedBoard?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issueBoards'] });
      toast({
        title: "Success",
        description: "Board updated successfully",
      });
      setDialogOpen(false);
      setSelectedBoard(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update board: " + error.message,
        variant: "destructive",
      });
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
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete board: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async (permissions: Partial<IssueBoardPermission>[]) => {
      if (!selectedBoardForPermissions) return;
      
      await supabase
        .from('issue_board_permissions')
        .delete()
        .eq('board_id', selectedBoardForPermissions.id);
      
      if (permissions.length > 0) {
        const permissionsWithBoardId = permissions.map(permission => ({
          ...permission,
          board_id: selectedBoardForPermissions.id,
          can_view: permission.can_view || false,
          can_create: permission.can_create || false,
          can_vote: permission.can_vote || false
        })) as {
          board_id: string;
          can_view: boolean;
          can_create: boolean;
          can_vote: boolean;
          sbu_id?: string;
          level_id?: string;
          location_id?: string;
          employment_type_id?: string;
          employee_type_id?: string;
          employee_role_id?: string;
        }[];

        const { error } = await supabase
          .from('issue_board_permissions')
          .insert(permissionsWithBoardId);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boardPermissions'] });
      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });
      setPermissionsDialogOpen(false);
      setSelectedBoardForPermissions(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update permissions: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: Pick<IssueBoard, 'name' | 'description' | 'status'>) => {
    if (selectedBoard) {
      updateBoardMutation.mutate(values);
    } else {
      createBoardMutation.mutate(values);
    }
  };

  const { data: boardPermissions } = useQuery({
    queryKey: ['boardPermissions', selectedBoardForPermissions?.id],
    queryFn: async () => {
      if (!selectedBoardForPermissions) return [];
      const { data, error } = await supabase
        .from('issue_board_permissions')
        .select('*')
        .eq('board_id', selectedBoardForPermissions.id);

      if (error) throw error;
      return data as IssueBoardPermission[];
    },
    enabled: !!selectedBoardForPermissions,
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

      <IssueBoardDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialValues={selectedBoard || undefined}
        mode={selectedBoard ? "edit" : "create"}
      />

      <BoardPermissionsDialog
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
        board={selectedBoardForPermissions!}
        onSubmit={handlePermissionsSubmit}
        permissions={boardPermissions}
      />
    </div>
  );
}
