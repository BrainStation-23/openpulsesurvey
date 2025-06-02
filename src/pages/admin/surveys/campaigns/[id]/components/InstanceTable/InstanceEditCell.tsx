
import { useState } from "react";
import { Pencil, Save, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Instance } from "../../hooks/useInstanceManagement";

interface InstanceEditCellProps {
  instance: Instance;
  editingId: string | null;
  editValues: Partial<Instance>;
  onEdit: (instance: Instance) => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (field: keyof Instance, value: any) => void;
  hasActiveInstance: (currentInstanceId?: string) => boolean;
}

export function InstanceEditCell({
  instance,
  editingId,
  editValues,
  onEdit,
  onSave,
  onCancel,
  onChange,
  hasActiveInstance
}: InstanceEditCellProps) {
  const isEditing = editingId === instance.id;
  const isThereActiveInstance = hasActiveInstance(instance.id);

  const getStatusColor = (status: string) => {
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

  if (isEditing) {
    return (
      <div className="flex space-x-2">
        <Button 
          variant="default" 
          size="icon" 
          onClick={onSave}
          className="h-8 w-8"
        >
          <Save className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel}
          className="h-8 w-8"
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => onEdit(instance)}
      className="h-8 w-8"
    >
      <Pencil className="h-4 w-4" />
    </Button>
  );
}

export function DateEditCell({
  field,
  value,
  editingId,
  instanceId,
  editValues,
  onChange
}: {
  field: 'starts_at' | 'ends_at';
  value: string;
  editingId: string | null;
  instanceId: string;
  editValues: Partial<Instance>;
  onChange: (field: keyof Instance, value: any) => void;
}) {
  const isEditing = editingId === instanceId;
  
  if (isEditing) {
    return (
      <Input 
        type="datetime-local"
        value={editValues[field] ? new Date(editValues[field]!).toISOString().slice(0, 16) : new Date(value).toISOString().slice(0, 16)}
        onChange={(e) => onChange(field, new Date(e.target.value).toISOString())}
      />
    );
  }

  return format(new Date(value), "PPP p");
}

export function StatusEditCell({
  status,
  editingId,
  instanceId,
  editValues,
  onChange,
  hasActiveInstance
}: {
  status: string;
  editingId: string | null;
  instanceId: string;
  editValues: Partial<Instance>;
  onChange: (field: keyof Instance, value: any) => void;
  hasActiveInstance: (currentInstanceId?: string) => boolean;
}) {
  const isEditing = editingId === instanceId;
  const currentStatus = isEditing ? (editValues.status || status) : status;
  const isThereActiveInstance = hasActiveInstance(instanceId);

  const getStatusColor = (status: string) => {
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

  if (isEditing) {
    return (
      <Select 
        value={currentStatus} 
        onValueChange={(value) => onChange("status", value)}
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
    );
  }

  return <Badge variant={getStatusColor(currentStatus)}>{currentStatus}</Badge>;
}
