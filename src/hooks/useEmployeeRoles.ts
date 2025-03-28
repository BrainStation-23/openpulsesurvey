
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type EmployeeRole = {
  id: string;
  name: string;
  color_code?: string;
};

export function useEmployeeRoles() {
  const [employeeRoles, setEmployeeRoles] = useState<EmployeeRole[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployeeRoles();
  }, []);

  const fetchEmployeeRoles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employee_roles')
        .select('id, name, color_code')
        .eq('status', 'active')
        .order('name');

      if (error) {
        throw error;
      }

      setEmployeeRoles(data);
    } catch (err: any) {
      setError(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to fetch employee roles: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    employeeRoles,
    loading,
    error,
    fetchEmployeeRoles,
  };
}
