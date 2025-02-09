
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ConfigPage } from "../shared/ConfigPage";

export default function EmployeeRoleConfig() {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: employeeRoles, isLoading } = useQuery({
    queryKey: ['employee-roles', sortOrder],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_roles')
        .select('*')
        .order('name', { ascending: sortOrder === 'asc' });
      
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: { name: string }) => {
      const { data, error } = await supabase
        .from('employee_roles')
        .insert([{ name: values.name }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-roles'] });
      toast({
        title: "Success",
        description: "Employee role created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create employee role",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from('employee_roles')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-roles'] });
      toast({
        title: "Success",
        description: "Employee role updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update employee role",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_roles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-roles'] });
      toast({
        title: "Success",
        description: "Employee role deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete employee role",
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: 'active' | 'inactive' }) => {
      const { data, error } = await supabase
        .from('employee_roles')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-roles'] });
      toast({
        title: "Success",
        description: "Employee role status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update employee role status",
        variant: "destructive",
      });
    },
  });

  const handleSort = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
  };

  return (
    <ConfigPage
      title="Employee Roles"
      items={employeeRoles || []}
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
