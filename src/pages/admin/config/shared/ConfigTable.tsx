
import { useState } from "react";
import { Pencil, Power, Trash2, ArrowUpDown, GripVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ConfigItem } from "./types";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

// Separate SortableRow component to properly handle useSortable hook
const SortableRow = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
    transition,
  };
  
  return (
    <TableRow ref={setNodeRef} style={style} data-id={id}>
      {children}
    </TableRow>
  );
};

// Regular row component that doesn't use any hooks
const RegularRow = ({ children }: { children: React.ReactNode }) => {
  return <TableRow>{children}</TableRow>;
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
  draggable = false,
}: {
  items: T[];
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  onToggleStatus?: (id: string, newStatus: "active" | "inactive") => void;
  isLoading: boolean;
  sortOrder?: "asc" | "desc";
  onSort?: () => void;
  onReorder?: (items: T[]) => void;
  draggable?: boolean;
}) {
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  
  const handleDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete.id);
      setItemToDelete(null);
    }
  };
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      const reorderedItems = [...items];
      const [movedItem] = reorderedItems.splice(oldIndex, 1);
      reorderedItems.splice(newIndex, 0, movedItem);
      
      if (onReorder) {
        onReorder(reorderedItems);
      }
    }
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Render different table structures based on draggable prop
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {draggable && <TableHead style={{ width: '40px' }}></TableHead>}
              <TableHead className="w-[300px]">
                {onSort ? (
                  <Button variant="ghost" onClick={onSort} className="flex items-center gap-1 p-0">
                    Name
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                ) : (
                  "Name"
                )}
              </TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          
          {draggable && onReorder ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                <TableBody>
                  {items.map((item) => (
                    <SortableRow key={item.id} id={item.id}>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="drag-handle cursor-grab">
                          <GripVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.name}
                        <span style={{ marginLeft: 8, display: 'inline-block', width: 14, height: 14, borderRadius: '50%', backgroundColor: item.color_code }} />
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {item.status || "active"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
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
                            onClick={() => setItemToDelete(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </SortableRow>
                  ))}
                </TableBody>
              </SortableContext>
            </DndContext>
          ) : (
            <TableBody>
              {items.map((item) => (
                <RegularRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.name}
                    <span style={{ marginLeft: 8, display: 'inline-block', width: 14, height: 14, borderRadius: '50%', backgroundColor: item.color_code }} />
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {item.status || "active"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
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
                        onClick={() => setItemToDelete(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </RegularRow>
              ))}
            </TableBody>
          )}
        </Table>
      </div>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
