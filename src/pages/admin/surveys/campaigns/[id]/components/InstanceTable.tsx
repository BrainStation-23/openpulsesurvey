
import { format } from "date-fns";
import { Pencil, Trash2, Plus, XCircle, ChevronDown, ChevronUp, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Instance, 
  InstanceSortOptions, 
  PaginationOptions 
} from "../hooks/useInstanceManagement";
import { useToast } from "@/hooks/use-toast";

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

  const renderSortIcon = (field: string) => {
    if (sort.sortBy !== field) return null;
    return sort.sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 ml-1" /> : 
      <ChevronDown className="h-4 w-4 ml-1" />;
  };

  const columns = [
    {
      accessorKey: "period_number",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => handleSort('period_number')}
          className="font-medium flex items-center p-0 h-8"
        >
          Period {renderSortIcon('period_number')}
        </Button>
      ),
      cell: ({ row }: any) => {
        return `#${row.original.period_number}`;
      },
    },
    {
      accessorKey: "starts_at",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => handleSort('starts_at')}
          className="font-medium flex items-center p-0 h-8"
        >
          Start Date {renderSortIcon('starts_at')}
        </Button>
      ),
      cell: ({ row }: any) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input 
            type="datetime-local"
            value={editValues.starts_at ? new Date(editValues.starts_at).toISOString().slice(0, 16) : new Date(row.original.starts_at).toISOString().slice(0, 16)}
            onChange={(e) => handleChange("starts_at", new Date(e.target.value).toISOString())}
          />
        ) : (
          format(new Date(row.original.starts_at), "PPP p")
        );
      },
    },
    {
      accessorKey: "ends_at",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => handleSort('ends_at')}
          className="font-medium flex items-center p-0 h-8"
        >
          End Date {renderSortIcon('ends_at')}
        </Button>
      ),
      cell: ({ row }: any) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input 
            type="datetime-local"
            value={editValues.ends_at ? new Date(editValues.ends_at).toISOString().slice(0, 16) : new Date(row.original.ends_at).toISOString().slice(0, 16)}
            onChange={(e) => handleChange("ends_at", new Date(e.target.value).toISOString())}
          />
        ) : (
          format(new Date(row.original.ends_at), "PPP p")
        );
      },
    },
    {
      accessorKey: "status",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => handleSort('status')}
          className="font-medium flex items-center p-0 h-8"
        >
          Status {renderSortIcon('status')}
        </Button>
      ),
      cell: ({ row }: any) => {
        const status = editingId === row.original.id ? 
          (editValues.status || row.original.status) : row.original.status;
        
        const getStatusColor = () => {
          switch (status) {
            case "active":
              return "default";
            case "upcoming":
              return "secondary";
            case "completed":
              return "success";
            default:
              return "secondary";
          }
        };

        const isThereActiveInstance = hasActiveInstance(row.original.id);

        return editingId === row.original.id ? (
          <Select 
            value={status} 
            onValueChange={(value) => handleChange("status", value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active" disabled={isThereActiveInstance}>
                Active {isThereActiveInstance && "(Another instance is already active)"}
              </SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge variant={getStatusColor()}>{status}</Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <div className="flex space-x-2">
            <Button 
              variant="default" 
              size="icon" 
              onClick={handleSave}
              className="h-8 w-8"
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCancel}
              className="h-8 w-8"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleEdit(row.original)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => confirmDelete(row.original.id)}
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const totalPages = Math.ceil(totalCount / pagination.pageSize);

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={pagination.page === i}
              onClick={() => onPageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink 
            isActive={pagination.page === 1}
            onClick={() => onPageChange(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );
      
      let startPage = Math.max(2, pagination.page - 1);
      let endPage = Math.min(totalPages - 1, pagination.page + 1);
      
      if (pagination.page <= 3) {
        endPage = Math.min(4, totalPages - 1);
      }
      
      if (pagination.page >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={pagination.page === i}
              onClick={() => onPageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
      
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink 
            isActive={pagination.page === totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Campaign Instances</h3>
        
        <Button 
          onClick={onAdd} 
          className="bg-primary text-primary-foreground flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Instance
        </Button>
      </div>
      
      <DataTable 
        columns={columns} 
        data={instances} 
        isLoading={isLoading}
      />
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Items per page:</span>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                {pagination.page === 1 ? (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    disabled 
                    className="cursor-not-allowed opacity-50"
                  >
                    <ChevronUp className="h-4 w-4 rotate-90" />
                  </Button>
                ) : (
                  <PaginationPrevious 
                    onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                  />
                )}
              </PaginationItem>
              
              {renderPaginationItems()}
              
              <PaginationItem>
                {pagination.page === totalPages ? (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    disabled 
                    className="cursor-not-allowed opacity-50"
                  >
                    <ChevronUp className="h-4 w-4 -rotate-90" />
                  </Button>
                ) : (
                  <PaginationNext 
                    onClick={() => onPageChange(Math.min(totalPages, pagination.page + 1))}
                  />
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this campaign instance? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
