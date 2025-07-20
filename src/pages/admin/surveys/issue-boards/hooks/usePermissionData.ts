import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PermissionDataOptions {
  id: string;
  name: string;
}

export interface UsePermissionDataReturn {
  sbus: PermissionDataOptions[];
  levels: PermissionDataOptions[];
  locations: PermissionDataOptions[];
  employmentTypes: PermissionDataOptions[];
  employeeTypes: PermissionDataOptions[];
  employeeRoles: PermissionDataOptions[];
  isLoading: boolean;
  error: Error | null;
}

export function usePermissionData(): UsePermissionDataReturn {
  const { data: sbus = [], isLoading: sbuLoading, error: sbuError } = useQuery({
    queryKey: ['sbus'],
    queryFn: async () => {
      const { data } = await supabase.from('sbus').select('id, name');
      return data || [];
    }
  });

  const { data: levels = [], isLoading: levelsLoading, error: levelsError } = useQuery({
    queryKey: ['levels'],
    queryFn: async () => {
      const { data } = await supabase.from('levels').select('id, name');
      return data || [];
    }
  });

  const { data: locations = [], isLoading: locationsLoading, error: locationsError } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data } = await supabase.from('locations').select('id, name');
      return data || [];
    }
  });

  const { data: employmentTypes = [], isLoading: employmentTypesLoading, error: employmentTypesError } = useQuery({
    queryKey: ['employmentTypes'],
    queryFn: async () => {
      const { data } = await supabase.from('employment_types').select('id, name');
      return data || [];
    }
  });

  const { data: employeeTypes = [], isLoading: employeeTypesLoading, error: employeeTypesError } = useQuery({
    queryKey: ['employeeTypes'],
    queryFn: async () => {
      const { data } = await supabase.from('employee_types').select('id, name');
      return data || [];
    }
  });

  const { data: employeeRoles = [], isLoading: employeeRolesLoading, error: employeeRolesError } = useQuery({
    queryKey: ['employeeRoles'],
    queryFn: async () => {
      const { data } = await supabase.from('employee_roles').select('id, name');
      return data || [];
    }
  });

  const isLoading = sbuLoading || levelsLoading || locationsLoading || 
                   employmentTypesLoading || employeeTypesLoading || employeeRolesLoading;

  const error = sbuError || levelsError || locationsError || 
                employmentTypesError || employeeTypesError || employeeRolesError;

  return {
    sbus,
    levels,
    locations,
    employmentTypes,
    employeeTypes,
    employeeRoles,
    isLoading,
    error: error as Error | null
  };
}