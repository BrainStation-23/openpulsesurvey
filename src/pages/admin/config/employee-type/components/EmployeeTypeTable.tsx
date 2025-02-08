import { useState } from "react";
import { Power, Pencil, Trash2, ArrowUpDown, Check } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EmployeeType {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  color_code: string;
}

interface EmployeeTypeTableProps {
  employeeTypes: EmployeeType[];
  onEdit: (employeeType: EmployeeType) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, newStatus: 'active' | 'inactive') => void;
  onColorChange: (id: string, color: string) => void;
  isLoading?: boolean;
  sortOrder: 'asc' | 'desc';
  onSort: () => void;
}

const PRESET_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD",
  "#D4A5A5", "#9B5DE5", "#F15BB5", "#00BBF9", "#00F5D4",
  "#E63946", "#457B9D", "#2A9D8F", "#E9C46A", "#E76F51"
];

export function EmployeeTypeTable({ 
  employeeTypes, 
  onEdit, 
  onDelete,
  onToggleStatus,
  onColorChange,
  isLoading,
  sortOrder,
  onSort
}: EmployeeTypeTableProps) {
  const [tempColors, setTempColors] = useState<Record<string, string>>({});
  const [openColorPicker, setOpenColorPicker] = useState<string | null>(null);

  const handleColorChange = (id: string, color: string) => {
    setTempColors(prev => ({ ...prev, [id]: color }));
  };

  const handleColorSubmit = (id: string) => {
    if (tempColors[id]) {
      onColorChange(id, tempColors[id]);
      setTempColors(prev => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
      setOpenColorPicker(null);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="ghost" onClick={onSort} className="h-8 p-0">
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Color</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employeeTypes?.map((type) => (
            <TableRow key={type.id}>
              <TableCell>{type.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded border" 
                    style={{ backgroundColor: tempColors[type.id] || type.color_code }}
                  />
                  <Popover open={openColorPicker === type.id} onOpenChange={(open) => {
                    if (open) {
                      setOpenColorPicker(type.id);
                    } else {
                      setOpenColorPicker(null);
                    }
                  }}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        Change Color
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4">
                      <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium">Custom Color</label>
                          <input
                            type="color"
                            value={tempColors[type.id] || type.color_code}
                            onChange={(e) => handleColorChange(type.id, e.target.value)}
                            className="w-full h-8 cursor-pointer"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Preset Colors</label>
                          <div className="grid grid-cols-5 gap-2">
                            {PRESET_COLORS.map((color, index) => (
                              <button
                                key={index}
                                className={`w-6 h-6 rounded-full border-2 transition-all ${
                                  (tempColors[type.id] || type.color_code) === color
                                    ? "border-ring scale-110"
                                    : "border-transparent hover:scale-110"
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorChange(type.id, color)}
                              />
                            ))}
                          </div>
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => handleColorSubmit(type.id)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Apply Color
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={type.status === 'active' ? "success" : "secondary"}>
                  {type.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleStatus(type.id, type.status === 'active' ? 'inactive' : 'active')}
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(type)}
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
                        <AlertDialogTitle>Delete Employee Type</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {type.name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(type.id)}
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
          {!isLoading && (!employeeTypes || employeeTypes.length === 0) && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No employee types found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
