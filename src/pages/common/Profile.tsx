
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { BasicInfoTab } from "@/pages/admin/users/components/EditUserDialog/BasicInfoTab";
import { SBUAssignmentTab } from "@/pages/admin/users/components/EditUserDialog/SBUAssignmentTab";
import { ManagementTab } from "@/pages/admin/users/components/EditUserDialog/ManagementTab";
import { EmploymentDetailsTab } from "@/pages/admin/users/components/EditUserDialog/EmploymentDetailsTab";
import { useProfileManagement } from "@/pages/admin/users/hooks/useProfileManagement";
import { useSupervisorManagement } from "@/pages/admin/users/hooks/useSupervisorManagement";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/pages/admin/users/types";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser, isLoading: isAuthLoading } = useCurrentUser();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the complete user profile data
  const { data: userData, error: userError } = useQuery({
    queryKey: ["userProfile", currentUser?.id],
    queryFn: async () => {
      console.log("Starting userProfile query for userId:", currentUser?.id);
      
      if (!currentUser?.id) {
        throw new Error("User not authenticated");
      }
      
      console.log("Fetching user data from API...");
      
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
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      if (!profileData) {
        throw new Error("Profile not found");
      }

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (roleError) throw roleError;

      return {
        ...profileData,
        user_roles: roleData
      } as User;
    },
    enabled: !!currentUser?.id,
  });

  useEffect(() => {
    if (userData) {
      setProfileUser(userData);
      setIsLoading(false);
    }
  }, [userData]);

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
  } = useProfileManagement(profileUser);

  const {
    supervisors,
    handleSupervisorChange,
    handlePrimarySupervisorChange,
  } = useSupervisorManagement(profileUser);

  if (isAuthLoading || isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-lg text-destructive">
            Error loading profile: {userError.message}
          </div>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-lg">Profile not found</div>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync();
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </div>

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
          />
        </TabsContent>

        <TabsContent value="sbus">
          {profileUser && <SBUAssignmentTab user={profileUser} />}
        </TabsContent>

        <TabsContent value="management">
          {profileUser && (
            <ManagementTab
              user={profileUser}
              supervisors={supervisors}
              onSupervisorChange={handleSupervisorChange}
              onPrimarySupervisorChange={handlePrimarySupervisorChange}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
