
import { useState } from 'react';
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

export default function UserProfile() {
  const { userId } = useCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await fetch(`/api/users/${userId}`).then(res => res.json());
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

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

  const {
    supervisors,
    handleSupervisorChange,
    handlePrimarySupervisorChange,
  } = useSupervisorManagement(user);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSave = async () => {
    try {
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
                lastName={setLastName}
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
              {user && <SBUAssignmentTab user={user} />}
            </TabsContent>

            <TabsContent value="management">
              {user && (
                <ManagementTab
                  user={user}
                  supervisors={supervisors}
                  onSupervisorChange={handleSupervisorChange}
                  onPrimarySupervisorChange={handlePrimarySupervisorChange}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
