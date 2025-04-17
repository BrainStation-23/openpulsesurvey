
import { format } from "date-fns";
import { Edit, Save, Trash2, Plus } from "lucide-react";
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
import { Instance } from "../hooks/useInstanceManagement";

interface InstanceTableProps {
  instances: Instance[];
  isLoading: boolean;
  onSave: (instance: Instance) => void;
  onDelete: (instanceId: string) => void;
  onAdd: () => void;
  campaign: any;
}

export function InstanceTable({ 
  instances, 
  isLoading, 
  onSave, 
  onDelete,
  onAdd,
  campaign
}: InstanceTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Instance>>({});

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

  const columns = [
    {
      accessorKey: "period_number",
      header: "Period",
      cell: ({ row }: any) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input 
            className="w-16"
            type="number"
            value={editValues.period_number || row.original.period_number}
            onChange={(e) => handleChange("period_number", parseInt(e.target.value))}
          />
        ) : (
          `#${row.original.period_number}`
        );
      },
    },
    {
      accessorKey: "starts_at",
      header: "Start Date",
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
      header: "End Date",
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
      header: "Status",
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
      header: "Completion Rate",
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
              variant="outline" 
              size="icon" 
              onClick={handleCancel}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
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
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDelete(row.original.id)}
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Campaign Instances</h3>
        <Button 
          onClick={onAdd} 
          variant="outline"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Instance
        </Button>
      </div>
      <DataTable 
        columns={columns} 
        data={instances} 
        isLoading={isLoading}
      />
    </div>
  );
}
