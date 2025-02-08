
import { useState } from "react";
import { ArrowLeft, Plus, ArrowUpDown, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

const PRESET_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD",
  "#D4A5A5", "#9B5DE5", "#F15BB5", "#00BBF9", "#00F5D4",
  "#E63946", "#457B9D", "#2A9D8F", "#E9C46A", "#E76F51"
];

export default function LevelConfig() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<any>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [tempColors, setTempColors] = useState<Record<string, string>>({});
  const [openColorPicker, setOpenColorPicker] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const { data: levels, isLoading } = useQuery({
    queryKey: ["levels", sortOrder],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("levels")
        .select("*")
        .order("name", { ascending: sortOrder === 'asc' });

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { error } = await supabase.from("levels").insert({
        name: values.name,
        status: 'active'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      setIsCreateOpen(false);
      form.reset();
      toast.success("Level created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create level");
      console.error("Error creating level:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...values }: { id: string } & z.infer<typeof formSchema>) => {
      const { error } = await supabase
        .from("levels")
        .update({ name: values.name })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      setEditingLevel(null);
      form.reset();
      toast.success("Level updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update level");
      console.error("Error updating level:", error);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "inactive" }) => {
      const { error } = await supabase
        .from("levels")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      toast.success("Level status updated");
    },
    onError: (error) => {
      toast.error("Failed to update level status");
      console.error("Error updating level status:", error);
    },
  });

  const updateColorMutation = useMutation({
    mutationFn: async ({ id, color }: { id: string; color: string }) => {
      const { error } = await supabase
        .from("levels")
        .update({ color_code: color })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      toast.success("Level color updated");
    },
    onError: (error) => {
      toast.error("Failed to update level color");
      console.error("Error updating level color:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("levels").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      toast.success("Level deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete level");
      console.error("Error deleting level:", error);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingLevel) {
      updateMutation.mutate({ id: editingLevel.id, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleSort = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
  };

  const handleColorChange = (id: string, color: string) => {
    setTempColors(prev => ({ ...prev, [id]: color }));
  };

  const handleColorSubmit = (id: string) => {
    if (tempColors[id]) {
      updateColorMutation.mutate({ id, color: tempColors[id] });
      setTempColors(prev => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
      setOpenColorPicker(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Level Configuration</h1>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Level
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Level</DialogTitle>
              <DialogDescription>
                Add a new level to assign to profiles.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter level name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Create Level</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={handleSort} className="h-8 p-0">
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : levels?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No levels found
                </TableCell>
              </TableRow>
            ) : (
              levels?.map((level) => (
                <TableRow key={level.id}>
                  <TableCell>{level.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border" 
                        style={{ backgroundColor: tempColors[level.id] || level.color_code }}
                      />
                      <Popover 
                        open={openColorPicker === level.id}
                        onOpenChange={(open) => {
                          if (open) {
                            setOpenColorPicker(level.id);
                          } else {
                            setOpenColorPicker(null);
                          }
                        }}
                      >
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
                                value={tempColors[level.id] || level.color_code}
                                onChange={(e) => handleColorChange(level.id, e.target.value)}
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
                                      (tempColors[level.id] || level.color_code) === color
                                        ? "border-ring scale-110"
                                        : "border-transparent hover:scale-110"
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleColorChange(level.id, color)}
                                  />
                                ))}
                              </div>
                            </div>
                            <Button 
                              className="w-full"
                              onClick={() => handleColorSubmit(level.id)}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Apply Color
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={level.status === "active"}
                      onCheckedChange={(checked) =>
                        toggleStatusMutation.mutate({
                          id: level.id,
                          status: checked ? "active" : "inactive",
                        })
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Dialog
                      open={editingLevel?.id === level.id}
                      onOpenChange={(open) => !open && setEditingLevel(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingLevel(level);
                            form.setValue("name", level.name);
                          }}
                        >
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Level</DialogTitle>
                          <DialogDescription>
                            Update the level details.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Level</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this level? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(level.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
