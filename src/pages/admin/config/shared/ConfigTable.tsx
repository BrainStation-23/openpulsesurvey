import { useState } from "react";
import * as React from "react";
import { Power, Pencil, Trash2, ArrowUpDown, GripVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ConfigTableProps, ConfigItem } from "./types";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

// Sortable item component
const SortableItem = ({ item, onEdit, onDelete, onToggleStatus }: { 
  item: ConfigItem; 
  onEdit: (item: ConfigItem) => void; 
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, newStatus: 'active' | 'inactive') => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="cursor-grab" {...attributes} {...listeners}>
            <GripVertical className="h-4 w-4" />
          </Button>
          {item.name}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded border"
            style={{ backgroundColor: item.color_code || '#CBD5E1' }}
          />
          <span className="text-sm text-muted-foreground">
            {item.color_code || '#CBD5E1'}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant={item.status === 'active' ? "success" : "secondary"}>
          {item.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleStatus(item.id, item.status === 'active' ? 'inactive' : 'active')}
          >
            <Power className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(item)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Item</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {item.name}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(item.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
};

export function ConfigTable<T extends ConfigItem>({ 
  items, 
  onEdit, 
  onDelete,
  onToggleStatus,
  isLoading,
  sortOrder,
  onSort,
  onReorder,
  draggable = false
}: ConfigTableProps<T>) {
  const [sortableItems, setSortableItems] = useState<T[]>([]);

  // Initialize sortable items when items change
  React.useEffect(() => {
    if (items) {
      setSortableItems([...items]);
    }
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = sortableItems.findIndex(item => item.id === active.id);
      const newIndex = sortableItems.findIndex(item => item.id === over.id);
      
      const newItems = [...sortableItems];
      const [removedItem] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, removedItem);
      
      setSortableItems(newItems);
      if (onReorder) {
        onReorder(newItems);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p>No items found</p>
      </div>
    );
  }

  const renderTableContent = () => {
    if (draggable && onReorder) {
      return (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext 
            items={sortableItems.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <TableBody>
              {sortableItems.map((item) => (
                <SortableItem 
                  key={item.id}
                  item={item}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                />
              ))}
            </TableBody>
          </SortableContext>
        </DndContext>
      );
    }

    return (
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: item.color_code || '#CBD5E1' }}
                />
                <span className="text-sm text-muted-foreground">
                  {item.color_code || '#CBD5E1'}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-center">
              <Badge variant={item.status === 'active' ? "success" : "secondary"}>
                {item.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleStatus(item.id, item.status === 'active' ? 'inactive' : 'active')}
                >
                  <Power className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(item)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Item</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {item.name}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(item.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              {!draggable && (
                <Button variant="ghost" onClick={onSort} className="h-8 p-0">
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              )}
              {draggable && "Name"}
            </TableHead>
            <TableHead>Color</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        {renderTableContent()}
      </Table>
    </div>
  );
}
