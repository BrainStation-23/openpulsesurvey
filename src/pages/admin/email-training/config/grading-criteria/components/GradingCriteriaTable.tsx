
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { GradingCriteria } from "../types";
import { ColumnDef } from "@tanstack/react-table";

interface Props {
  criteria: GradingCriteria[];
  onEdit: (criteria: GradingCriteria) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, newStatus: 'active' | 'inactive') => void;
  isLoading?: boolean;
}

export function GradingCriteriaTable({ criteria, onEdit, onDelete, onToggleStatus, isLoading }: Props) {
  const columns: ColumnDef<GradingCriteria>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "max_points",
      header: "Maximum Points",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          onClick={() => onToggleStatus(
            row.original.id,
            row.original.status === 'active' ? 'inactive' : 'active'
          )}
        >
          {row.original.status === 'active' ? 'Active' : 'Inactive'}
        </Button>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(row.original)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(row.original.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={criteria}
      isLoading={isLoading}
    />
  );
}
