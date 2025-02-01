import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Power } from "lucide-react";
import { User } from "../../types";
import { TableContainer } from "./TableContainer";
import { TablePagination } from "./TablePagination";
import EditUserDialog from "../EditUserDialog";
import { ExportProgress } from "./ExportProgress";
import { ImportDialog } from "../ImportDialog";
import { exportUsers } from "../../utils/exportUsers";
import { usePasswordManagement } from "../../hooks/usePasswordManagement";
import { useUserFilters } from "../../hooks/useUserFilters";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onDelete: (userId: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedSBU: string;
  onPageSizeChange: (size: number) => void;
}

export default function UserTable({
  users,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onDelete,
  searchTerm,
  setSearchTerm,
  selectedSBU,
  onPageSizeChange,
}: UserTableProps) {
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { filteredUsers } = useUserFilters(users, selectedSBU);

  const [exportProgress, setExportProgress] = useState({
    isOpen: false,
    processed: 0,
    total: 0,
    error: "",
    isComplete: false,
  });

  const handleImportComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const totalPages = Math.ceil(total / pageSize);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const userId of selectedUsers) {
        await onDelete(userId);
      }
      toast({
        title: "Success",
        description: `Successfully deleted ${selectedUsers.length} users`,
      });
      setSelectedUsers([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete selected users",
        variant: "destructive",
      });
    }
  };

  const handleBulkStatusToggle = async () => {
    try {
      // Get the current status of the first selected user to determine the toggle action
      const { data: firstUser } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', selectedUsers[0])
        .single();

      const newStatus = firstUser?.status === 'active' ? 'disabled' : 'active';

      // Update all selected users
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .in('id', selectedUsers);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      toast({
        title: "Success",
        description: `Successfully ${newStatus === 'active' ? 'activated' : 'deactivated'} ${selectedUsers.length} users`,
      });
      
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative min-h-[400px]">
        <TableContainer
          users={filteredUsers}
          onEdit={setUserToEdit}
          onDelete={onDelete}
          isLoading={isLoading}
          selectedUsers={selectedUsers}
          onSelectAll={handleSelectAll}
          onSelectUser={handleSelectUser}
        />
      </div>

      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={handleImportComplete}
      />

      <ExportProgress
        open={exportProgress.isOpen}
        onOpenChange={(open) =>
          setExportProgress((prev) => ({ ...prev, isOpen: open }))
        }
        progress={exportProgress.processed}
        total={exportProgress.total}
        error={exportProgress.error}
        isComplete={exportProgress.isComplete}
      />

      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <EditUserDialog
        user={userToEdit}
        open={!!userToEdit}
        onOpenChange={(open) => !open && setUserToEdit(null)}
      />
    </div>
  );
}