
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from './useCurrentUser';

export type GenderType = 'male' | 'female' | 'other';

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  gender: GenderType;
  dateOfBirth: Date | undefined;
  designation: string;
  selectedLevel: string;
  selectedLocation: string;
  selectedEmploymentType: string;
  selectedEmployeeRole: string;
  selectedEmployeeType: string;
}

export function useUserProfile() {
  const { userId } = useCurrentUser();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    profileImageUrl: '',
    gender: 'male',
    dateOfBirth: undefined,
    designation: '',
    selectedLevel: '',
    selectedLocation: '',
    selectedEmploymentType: '',
    selectedEmployeeRole: '',
    selectedEmployeeType: '',
  });

  // Fetch user profile data
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          levels (*),
          locations (*),
          employment_types (*),
          employee_roles (*),
          employee_types (*)
        `)
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Get available options for dropdowns
  const { data: levels } = useQuery({
    queryKey: ['levels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: employmentTypes } = useQuery({
    queryKey: ['employmentTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employment_types')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: employeeRoles } = useQuery({
    queryKey: ['employeeRoles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_roles')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: employeeTypes } = useQuery({
    queryKey: ['employeeTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_types')
        .select('*')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Update form data when profile data is loaded
  useEffect(() => {
    if (profileData) {
      setFormData({
        firstName: profileData.first_name || '',
        lastName: profileData.last_name || '',
        profileImageUrl: profileData.profile_image_url || '',
        gender: profileData.gender || 'male',
        dateOfBirth: profileData.date_of_birth ? new Date(profileData.date_of_birth) : undefined,
        designation: profileData.designation || '',
        selectedLevel: profileData.level_id || '',
        selectedLocation: profileData.location_id || '',
        selectedEmploymentType: profileData.employment_type_id || '',
        selectedEmployeeRole: profileData.employee_role_id || '',
        selectedEmployeeType: profileData.employee_type_id || '',
      });
    }
  }, [profileData]);

  // Handle form data change
  const handleChange = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;

      const updateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        profile_image_url: formData.profileImageUrl,
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth?.toISOString().split('T')[0] || null,
        designation: formData.designation,
        level_id: formData.selectedLevel || null,
        location_id: formData.selectedLocation || null,
        employment_type_id: formData.selectedEmploymentType || null,
        employee_role_id: formData.selectedEmployeeRole || null,
        employee_type_id: formData.selectedEmployeeType || null,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    },
  });

  return {
    userId,
    formData,
    handleChange,
    updateProfileMutation,
    isProfileLoading,
    profileData,
    levels,
    locations,
    employmentTypes,
    employeeRoles,
    employeeTypes
  };
}
