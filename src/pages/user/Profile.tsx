
import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BasicInfoTab } from '../admin/users/components/EditUserDialog/BasicInfoTab';
import { EmploymentDetailsTab } from '../admin/users/components/EditUserDialog/EmploymentDetailsTab';
import { SBUAssignmentTab } from '../admin/users/components/EditUserDialog/SBUAssignmentTab';
import { ManagementTab } from '../admin/users/components/EditUserDialog/ManagementTab';
import { useProfileManagement } from '../admin/users/hooks/useProfileManagement';
import { useSupervisorManagement } from '../admin/users/hooks/useSupervisorManagement';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export default function UserProfile() {
  console.log('UserProfile component rendering');
  const { userId, user: authUser } = useCurrentUser();
  console.log('UserId from useCurrentUser:', userId);
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      console.log('Starting userProfile query for userId:', userId);
      if (!userId) {
        console.log('No userId available, returning null');
        return null;
      }
      
      try {
        console.log('Fetching user data from Supabase...');
        const startFetchTime = performance.now();
        
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select(`
            id,
            email,
            first_name,
            last_name,
            profile_image_url,
            level_id,
            levels (
              id,
              name,
              status
            ),
            user_sbus (
              id,
              user_id,
              sbu_id,
              is_primary,
              sbu:sbus (
                id,
                name
              )
            ),
            org_id,
            gender,
            date_of_birth,
            designation,
            location_id,
            employment_type_id,
            employee_role_id,
            employee_type_id,
            status
          `)
          .eq("id", userId)
          .maybeSingle();
        
        const fetchDuration = performance.now() - startFetchTime;
        console.log(`Supabase fetch completed in ${fetchDuration.toFixed(2)}ms`);
        
        if (profileError) {
          console.error('Error fetching profile data:', profileError);
          throw profileError;
        }
        
        if (!profileData) {
          throw new Error('Profile not found');
        }
        
        // Get user role
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();
        
        if (roleError) throw roleError;
        
        console.log('User data received:', profileData);
        return {
          ...profileData,
          user_roles: roleData
        };
      } catch (error) {
        console.error('Error in queryFn:', error);
        throw error;
      }
    },
    enabled: !!userId,
  });

  useEffect(() => {
    console.log('User data updated:', user);
  }, [user]);

  const {
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
    updateProfileMutation,
  } = useProfileManagement(user);

  console.log('Profile management data loaded:', {
    firstName,
    lastName,
    selectedLevel,
    selectedLocation,
    selectedEmploymentType
  });

  const {
    supervisors,
    handleSupervisorChange,
    handlePrimarySupervisorChange,
  } = useSupervisorManagement(user);

  console.log('Supervisors loaded:', supervisors?.length || 0);

  if (isLoading) {
    console.log('Profile page in loading state');
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    console.error('Error loading profile:', error);
    toast.error("Failed to load profile");
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              Failed to load profile. Please try again later.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      console.log('Starting profile update...');
      await updateProfileMutation.mutateAsync();
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              Edit Basic Information
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            View and manage your personal details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList>
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="employment">Employment Details</TabsTrigger>
              <TabsTrigger value="sbus">SBU Assignment</TabsTrigger>
              <TabsTrigger value="management">Management</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <BasicInfoTab
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                profileImageUrl={profileImageUrl}
                setProfileImageUrl={setProfileImageUrl}
                orgId={orgId}
                setOrgId={setOrgId}
                gender={gender}
                setGender={setGender}
                dateOfBirth={dateOfBirth}
                setDateOfBirth={setDateOfBirth}
                disabled={!isEditing}
              />
            </TabsContent>

            <TabsContent value="employment">
              <EmploymentDetailsTab
                designation={designation}
                setDesignation={setDesignation}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                selectedEmploymentType={selectedEmploymentType}
                setSelectedEmploymentType={setSelectedEmploymentType}
                selectedLevel={selectedLevel}
                setSelectedLevel={setSelectedLevel}
                selectedEmployeeRole={selectedEmployeeRole}
                setSelectedEmployeeRole={setSelectedEmployeeRole}
                selectedEmployeeType={selectedEmployeeType}
                setSelectedEmployeeType={setSelectedEmployeeType}
                disabled={true} // Always disabled - read-only
              />
            </TabsContent>

            <TabsContent value="sbus">
              {user && <SBUAssignmentTab user={user} readOnly={true} />}
            </TabsContent>

            <TabsContent value="management">
              {user && (
                <ManagementTab
                  user={user}
                  supervisors={supervisors}
                  onSupervisorChange={() => {}} // No-op function since it's read-only
                  onPrimarySupervisorChange={() => {}} // No-op function since it's read-only
                  readOnly={true}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
