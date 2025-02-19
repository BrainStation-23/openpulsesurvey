
import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GradingCriteriaForm } from "./components/GradingCriteriaForm";
import { GradingCriteriaTable } from "./components/GradingCriteriaTable";
import type { GradingCriteria, GradingCriteriaFormData } from "./types";

export function GradingCriteriaTab() {
  const [selectedCriteria, setSelectedCriteria] = useState<GradingCriteria | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: criteria, isLoading } = useQuery({
    queryKey: ['grading-criteria'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grading_criteria')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as GradingCriteria[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: GradingCriteriaFormData) => {
      const { error } = await supabase
        .from('grading_criteria')
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading-criteria'] });
      setIsDialogOpen(false);
      toast.success("Grading criteria created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create grading criteria");
      console.error('Error creating criteria:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: GradingCriteriaFormData }) => {
      const { error } = await supabase
        .from('grading_criteria')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading-criteria'] });
      setIsDialogOpen(false);
      setSelectedCriteria(null);
      toast.success("Grading criteria updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update grading criteria");
      console.error('Error updating criteria:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('grading_criteria')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading-criteria'] });
      toast.success("Grading criteria deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete grading criteria");
      console.error('Error deleting criteria:', error);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: 'active' | 'inactive' }) => {
      const { error } = await supabase
        .from('grading_criteria')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading-criteria'] });
      toast.success("Status updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update status");
      console.error('Error updating status:', error);
    },
  });

  const handleSubmit = (data: GradingCriteriaFormData) => {
    if (selectedCriteria) {
      updateMutation.mutate({ id: selectedCriteria.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Grading Criteria</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Criteria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCriteria ? "Edit Grading Criteria" : "Add Grading Criteria"}
              </DialogTitle>
            </DialogHeader>
            <GradingCriteriaForm
              onSubmit={handleSubmit}
              initialValues={selectedCriteria}
              submitLabel={selectedCriteria ? "Update" : "Create"}
            />
          </DialogContent>
        </Dialog>
      </div>

      <GradingCriteriaTable
        criteria={criteria || []}
        onEdit={(criteria) => {
          setSelectedCriteria(criteria);
          setIsDialogOpen(true);
        }}
        onDelete={(id) => deleteMutation.mutate(id)}
        onToggleStatus={(id, newStatus) => toggleStatusMutation.mutate({ id, newStatus })}
        isLoading={isLoading}
      />
    </div>
  );
}
