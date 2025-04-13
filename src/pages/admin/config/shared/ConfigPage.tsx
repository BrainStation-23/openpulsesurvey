
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfigForm } from "./ConfigForm";
import { ConfigTable } from "./ConfigTable";
import { ConfigPageProps, ConfigItem } from "./types";

export function ConfigPage<T extends ConfigItem>({
  title,
  items,
  isLoading,
  sortOrder,
  onSort,
  onCreate,
  onUpdate,
  onDelete,
  onToggleStatus,
  onReorder,
  draggable = false,
}: ConfigPageProps<T>) {
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = (values: { name: string; color_code?: string }) => {
    if (selectedItem) {
      onUpdate(selectedItem.id, values);
    } else {
      onCreate(values);
    }
    setIsDialogOpen(false);
    setSelectedItem(null);
  };

  const handleReorder = (reorderedItems: T[]) => {
    if (onReorder) {
      onReorder(reorderedItems);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add {title.slice(0, -1)}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedItem ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`}
              </DialogTitle>
            </DialogHeader>
            <ConfigForm
              onSubmit={handleSubmit}
              initialValues={selectedItem}
              submitLabel={selectedItem ? `Update ${title.slice(0, -1)}` : `Create ${title.slice(0, -1)}`}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ConfigTable
        items={items}
        onEdit={(item) => {
          setSelectedItem(item);
          setIsDialogOpen(true);
        }}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
        isLoading={isLoading}
        sortOrder={sortOrder}
        onSort={onSort}
        onReorder={handleReorder}
        draggable={draggable}
      />
    </div>
  );
}
