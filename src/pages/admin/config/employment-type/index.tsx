
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ConfigPage } from "../shared/ConfigPage";
import { toast } from "sonner";

export default function EmploymentTypeConfig() {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const queryClient = useQueryClient();

  const { data: employmentTypes, isLoading } = useQuery({
    queryKey: ['employment-types', sortOrder],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employment_types')
        .select('*')
        .order('name', { ascending: sortOrder === 'asc' });
      
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: { name: string }) => {
      const { data, error } = await supabase
        .from('employment_types')
        .insert([{ name: values.name }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-types'] });
      toast.success("Employment type created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create employment type");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('employment_types')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-types'] });
      toast.success("Employment type updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update employment type");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employment_types')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-types'] });
      toast.success("Employment type deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete employment type");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: 'active' | 'inactive' }) => {
      const { data, error } = await supabase
        .from('employment_types')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employment-types'] });
      toast.success("Employment type status updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update employment type status");
    },
  });

  const handleSort = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
  };

  return (
    <ConfigPage
      title="Employment Types"
      items={employmentTypes || []}
      isLoading={isLoading}
      sortOrder={sortOrder}
      onSort={handleSort}
      onCreate={createMutation.mutate}
      onUpdate={(id, values) => updateMutation.mutate({ id, ...values })}
      onDelete={deleteMutation.mutate}
      onToggleStatus={(id, newStatus) => toggleStatusMutation.mutate({ id, newStatus })}
    />
  );
}
