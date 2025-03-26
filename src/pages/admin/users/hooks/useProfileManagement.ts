
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, GenderType } from "../types";

export function useProfileManagement(user: User | null) {
  console.log('useProfileManagement hook called with user:', user?.id);
  const startTime = performance.now();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [orgId, setOrgId] = useState("");
  const [gender, setGender] = useState<GenderType>("male");
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [designation, setDesignation] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState("");
  const [selectedEmployeeRole, setSelectedEmployeeRole] = useState("");
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("");
  const queryClient = useQueryClient();

  // Don't refetch profile data - it's already provided by parent
  const { error: profileError } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => user,
    enabled: false, // Don't actually run this query
  });

  useEffect(() => {
    if (user) {
      console.log('Setting initial form values from user data');
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setProfileImageUrl(user.profile_image_url || '');
      setSelectedLevel(user.level_id || '');
      setOrgId(user.org_id || '');
      setGender(user.gender || 'male');
      setDateOfBirth(user.date_of_birth ? new Date(user.date_of_birth) : undefined);
      setDesignation(user.designation || '');
      setSelectedLocation(user.location_id || '');
      setSelectedEmploymentType(user.employment_type_id || '');
      setSelectedEmployeeRole(user.employee_role_id || '');
      setSelectedEmployeeType(user.employee_type_id || '');
    }
  }, [user]);

  useEffect(() => {
    const hookDuration = performance.now() - startTime;
    console.log(`useProfileManagement hook initialization took ${hookDuration.toFixed(2)}ms`);
  }, [startTime]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      console.log('Executing profile update mutation');
      if (!user) return;

      const updateData = {
        first_name: firstName,
        last_name: lastName,
        profile_image_url: profileImageUrl,
        level_id: selectedLevel || null,
        org_id: orgId || null,
        gender: gender || null,
        date_of_birth: dateOfBirth?.toISOString().split('T')[0] || null,
        designation: designation || null,
        location_id: selectedLocation || null,
        employment_type_id: selectedEmploymentType || null,
        employee_role_id: selectedEmployeeRole || null,
        employee_type_id: selectedEmployeeType || null,
      };

      console.log('Updating profile with data:', {
        userId: user.id,
        updateData,
        currentFormState: {
          selectedLevel,
          orgId,
          designation,
          selectedLocation,
          selectedEmploymentType,
          selectedEmployeeRole,
          selectedEmployeeType
        }
      });

      const { error: profileError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      const { data: updatedProfile, error: fetchError } = await supabase
        .from("profiles")
        .select('*')
        .eq("id", user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching updated profile:', fetchError);
      } else {
        console.log('Profile after update:', updatedProfile);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", user?.id] });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      console.error("Error in update mutation:", error);
      toast.error("Failed to update profile");
    }
  });

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    profileImageUrl,
    setProfileImageUrl,
    selectedLevel,
    setSelectedLevel,
    orgId,
    setOrgId,
    gender,
    setGender,
    dateOfBirth,
    setDateOfBirth,
    designation,
    setDesignation,
    selectedLocation,
    setSelectedLocation,
    selectedEmploymentType,
    setSelectedEmploymentType,
    selectedEmployeeRole,
    setSelectedEmployeeRole,
    selectedEmployeeType,
    setSelectedEmployeeType,
    profileData: user,
    profileError,
    updateProfileMutation,
  };
}
