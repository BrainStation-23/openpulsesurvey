
import { useState } from "react";
import { GripVertical } from "lucide-react";
import { Table, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { ConfigItem } from "./types";
import { SortableRow, RegularRow } from "./components/TableRows";
import { ConfigTableHeader } from "./components/ConfigTableHeader";
import { ItemActions } from "./components/ItemActions";
import { DeleteConfirmationDialog } from "./components/DeleteConfirmationDialog";

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
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );
  
  const handleDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete.id);
      setItemToDelete(null);
    }
  };
  
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
  
  // Function to handle setting the item to delete
  const handleSetItemToDelete = (item: T) => {
    setItemToDelete(item);
  };
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <ConfigTableHeader draggable={draggable} onSort={onSort} />
          
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
                        <ItemActions
                          item={item}
                          onEdit={onEdit}
                          onDelete={handleSetItemToDelete}
                          onToggleStatus={onToggleStatus}
                        />
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
                    <ItemActions
                      item={item}
                      onEdit={onEdit}
                      onDelete={handleSetItemToDelete}
                      onToggleStatus={onToggleStatus}
                    />
                  </TableCell>
                </RegularRow>
              ))}
            </TableBody>
          )}
        </Table>
      </div>

      <DeleteConfirmationDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
