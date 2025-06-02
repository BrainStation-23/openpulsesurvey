
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Instance, InstanceSortOptions } from "../../hooks/useInstanceManagement";
import { InstanceEditCell, DateEditCell, StatusEditCell } from "./InstanceEditCell";

interface InstanceTableColumnsProps {
  editingId: string | null;
  editValues: Partial<Instance>;
  sort: InstanceSortOptions;
  onEdit: (instance: Instance) => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (field: keyof Instance, value: any) => void;
  onDelete: (instanceId: string) => void;
  onSort: (field: string) => void;
  hasActiveInstance: (currentInstanceId?: string) => boolean;
}

export function useInstanceTableColumns({
  editingId,
  editValues,
  sort,
  onEdit,
  onSave,
  onCancel,
  onChange,
  onDelete,
  onSort,
  hasActiveInstance
}: InstanceTableColumnsProps) {
  const renderSortIcon = (field: string) => {
    if (sort.sortBy !== field) return null;
    return sort.sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 ml-1" /> : 
      <ChevronDown className="h-4 w-4 ml-1" />;
  };

  return [
    {
      accessorKey: "period_number",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => onSort('period_number')}
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
          onClick={() => onSort('starts_at')}
          className="font-medium flex items-center p-0 h-8"
        >
          Start Date {renderSortIcon('starts_at')}
        </Button>
      ),
      cell: ({ row }: any) => (
        <DateEditCell
          field="starts_at"
          value={row.original.starts_at}
          editingId={editingId}
          instanceId={row.original.id}
          editValues={editValues}
          onChange={onChange}
        />
      ),
    },
    {
      accessorKey: "ends_at",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => onSort('ends_at')}
          className="font-medium flex items-center p-0 h-8"
        >
          End Date {renderSortIcon('ends_at')}
        </Button>
      ),
      cell: ({ row }: any) => (
        <DateEditCell
          field="ends_at"
          value={row.original.ends_at}
          editingId={editingId}
          instanceId={row.original.id}
          editValues={editValues}
          onChange={onChange}
        />
      ),
    },
    {
      accessorKey: "status",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => onSort('status')}
          className="font-medium flex items-center p-0 h-8"
        >
          Status {renderSortIcon('status')}
        </Button>
      ),
      cell: ({ row }: any) => (
        <StatusEditCell
          status={row.original.status}
          editingId={editingId}
          instanceId={row.original.id}
          editValues={editValues}
          onChange={onChange}
          hasActiveInstance={hasActiveInstance}
        />
      ),
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const isEditing = editingId === row.original.id;
        return (
          <div className="flex space-x-2">
            <InstanceEditCell
              instance={row.original}
              editingId={editingId}
              editValues={editValues}
              onEdit={onEdit}
              onSave={onSave}
              onCancel={onCancel}
              onChange={onChange}
              hasActiveInstance={hasActiveInstance}
            />
            {!isEditing && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDelete(row.original.id)}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}
