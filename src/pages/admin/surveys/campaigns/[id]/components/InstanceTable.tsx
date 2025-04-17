
import { format } from "date-fns";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Instance } from "../hooks/useInstanceManagement";

interface InstanceTableProps {
  instances: Instance[];
  isLoading: boolean;
  onEdit: (instance: Instance) => void;
}

export function InstanceTable({ instances, isLoading, onEdit }: InstanceTableProps) {
  const columns = [
    {
      accessorKey: "period_number",
      header: "Period",
      cell: ({ row }: any) => `#${row.original.period_number}`,
    },
    {
      accessorKey: "starts_at",
      header: "Start Date",
      cell: ({ row }: any) => {
        const date = new Date(row.original.starts_at);
        return format(date, "PPP p"); // Format with date and time
      },
    },
    {
      accessorKey: "ends_at",
      header: "End Date",
      cell: ({ row }: any) => {
        const date = new Date(row.original.ends_at);
        return format(date, "PPP p"); // Format with date and time
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status;
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

        return <Badge variant={getStatusColor()}>{status}</Badge>;
      },
    },
    {
      accessorKey: "completion_rate",
      header: "Completion Rate",
      cell: ({ row }: any) => {
        const rate = row.original.completion_rate || 0;
        return `${rate.toFixed(1)}%`;
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onEdit(row.original)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <DataTable 
      columns={columns} 
      data={instances} 
      isLoading={isLoading}
    />
  );
}
