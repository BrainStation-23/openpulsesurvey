
import { useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BasicInfoTab } from '../admin/users/components/EditUserDialog/BasicInfoTab';
import { EmploymentDetailsTab } from '../admin/users/components/EditUserDialog/EmploymentDetailsTab';
import { useProfileManagement } from '../admin/users/hooks/useProfileManagement';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = () => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

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
              Edit Profile
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

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src={profileImageUrl} alt={`${firstName} ${lastName}`} />
              <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
            </Avatar>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
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
                  disabled={!isEditing}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
