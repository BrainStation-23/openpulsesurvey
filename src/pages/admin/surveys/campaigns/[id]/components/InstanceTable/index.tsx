
import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { 
  Instance, 
  InstanceSortOptions, 
  PaginationOptions 
} from "../../hooks/useInstanceManagement";
import { InstanceTableHeader } from "./InstanceTableHeader";
import { InstancePagination } from "./InstancePagination";
import { InstanceDeleteDialog } from "./InstanceDeleteDialog";
import { useInstanceTableColumns } from "./InstanceTableColumns";

interface InstanceTableProps {
  instances: Instance[];
  totalCount: number;
  pagination: PaginationOptions;
  sort: InstanceSortOptions;
  isLoading: boolean;
  onSave: (instance: Instance) => void;
  onDelete: (instanceId: string) => void;
  onAdd: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
  campaign: any;
  hasActiveInstance: (currentInstanceId?: string) => boolean;
}

export function InstanceTable({ 
  instances, 
  totalCount,
  pagination,
  sort,
  isLoading, 
  onSave, 
  onDelete,
  onAdd,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  campaign,
  hasActiveInstance
}: InstanceTableProps) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Instance>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [instanceToDelete, setInstanceToDelete] = useState<string | null>(null);

  const handleEdit = (instance: Instance) => {
    setEditingId(instance.id);
    setEditValues({ ...instance });
  };

  const handleSave = () => {
    if (editingId && editValues) {
      onSave({ ...instances.find(i => i.id === editingId) as Instance, ...editValues });
      setEditingId(null);
      setEditValues({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleChange = (field: keyof Instance, value: any) => {
    if (field === 'status' && value === 'active' && hasActiveInstance(editingId)) {
      toast({
        variant: "destructive",
        title: "Cannot activate instance",
        description: "There is already an active instance for this campaign. Please mark it as completed or inactive first."
      });
      return;
    }
    
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const confirmDelete = (instanceId: string) => {
    setInstanceToDelete(instanceId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (instanceToDelete) {
      onDelete(instanceToDelete);
      setDeleteConfirmOpen(false);
      setInstanceToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setInstanceToDelete(null);
  };

  const handleSort = (field: string) => {
    const newDirection = 
      sort.sortBy === field && sort.sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(field, newDirection);
  };

  const columns = useInstanceTableColumns({
    editingId,
    editValues,
    sort,
    onEdit: handleEdit,
    onSave: handleSave,
    onCancel: handleCancel,
    onChange: handleChange,
    onDelete: confirmDelete,
    onSort: handleSort,
    hasActiveInstance
  });

  return (
    <div className="space-y-4">
      <InstanceTableHeader onAdd={onAdd} />
      
      <DataTable 
        columns={columns} 
        data={instances} 
        isLoading={isLoading}
      />
      
      <InstancePagination
        totalCount={totalCount}
        pagination={pagination}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      <InstanceDeleteDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
