
import { Button } from "@/components/ui/button";
import { Pencil, Power, Trash2 } from "lucide-react";
import { ConfigItem } from "../types";

interface ItemActionsProps<T extends ConfigItem> {
  item: T;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  onToggleStatus?: (id: string, newStatus: "active" | "inactive") => void;
}

export function ItemActions<T extends ConfigItem>({ 
  item, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: ItemActionsProps<T>) {
  return (
    <div className="flex justify-end gap-2">
      {onToggleStatus && (
        <Button 
          variant="ghost" 
          size="icon"
          className="toggle-status-button"
          onClick={() => onToggleStatus(item.id, item.status === "active" ? "inactive" : "active")}
        >
          <Power className="h-4 w-4" />
        </Button>
      )}
      <Button 
        variant="ghost" 
        size="icon"
        className="edit-level-button"
        onClick={() => onEdit(item)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onDelete(item)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
