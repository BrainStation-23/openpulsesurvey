
import { format } from "date-fns";
import { Save, Trash2, Plus, XCircle, ChevronDown, ChevronUp } from "lucide-react";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Instance, 
  InstanceFilters, 
  InstanceSortOptions, 
  PaginationOptions 
} from "../hooks/useInstanceManagement";
import { InstanceFilters as InstanceFiltersComponent } from "./InstanceFilters";

interface InstanceTableProps {
  instances: Instance[];
  totalCount: number;
  pagination: PaginationOptions;
  sort: InstanceSortOptions;
  filters: InstanceFilters;
  isLoading: boolean;
  onSave: (instance: Instance) => void;
  onDelete: (instanceId: string) => void;
  onAdd: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
  onFilterChange: (filters: any) => void;
  campaign: any;
}

export function InstanceTable({ 
  instances, 
  totalCount,
  pagination,
  sort,
  filters,
  isLoading, 
  onSave, 
  onDelete,
  onAdd,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onFilterChange,
  campaign
}: InstanceTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Instance>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [instanceToDelete, setInstanceToDelete] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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
        // Period number is now read-only
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
            case "inactive":
              return "destructive";
            default:
              return "secondary";
          }
        };

        return editingId === row.original.id ? (
          <Select 
            value={status} 
            onValueChange={(value) => handleChange("status", value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge variant={getStatusColor()}>{status}</Badge>
        );
      },
    },
    {
      accessorKey: "completion_rate",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => handleSort('completion_rate')}
          className="font-medium flex items-center p-0 h-8"
        >
          Completion Rate {renderSortIcon('completion_rate')}
        </Button>
      ),
      cell: ({ row }: any) => {
        const rate = row.original.completion_rate || 0;
        return `${rate.toFixed(1)}%`;
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
              <Save className="h-4 w-4" />
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

  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalCount / pagination.pageSize);

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // If we have fewer pages than our max, show all pages
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
      // Always show first page
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
      
      // Calculate range around current page
      let startPage = Math.max(2, pagination.page - 1);
      let endPage = Math.min(totalPages - 1, pagination.page + 1);
      
      // Adjust if we're near the beginning
      if (pagination.page <= 3) {
        endPage = Math.min(4, totalPages - 1);
      }
      
      // Adjust if we're near the end
      if (pagination.page >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      // Show ellipsis if needed before middle pages
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      // Add middle pages
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
      
      // Show ellipsis if needed after middle pages
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      // Always show last page
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
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h3 className="text-lg font-medium">Campaign Instances</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <Collapsible 
            open={isFiltersOpen} 
            onOpenChange={setIsFiltersOpen}
            className="w-full md:w-auto"
          >
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                {isFiltersOpen ? "Hide Filters" : "Show Filters"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 p-4 border rounded-md">
              <InstanceFiltersComponent 
                onFilterChange={onFilterChange}
                currentFilters={filters}
              />
            </CollapsibleContent>
          </Collapsible>
          <Button 
            onClick={onAdd} 
            variant="outline"
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Add Instance
          </Button>
        </div>
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
                <PaginationPrevious 
                  onClick={() => onPageChange(Math.max(1, pagination.page - 1))} 
                  disabled={pagination.page === 1} 
                  className={pagination.page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {renderPaginationItems()}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => onPageChange(Math.min(totalPages, pagination.page + 1))} 
                  disabled={pagination.page === totalPages}
                  className={pagination.page === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
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
