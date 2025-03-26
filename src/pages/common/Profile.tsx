
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { LoadingState } from "./profile/LoadingState";
import { ErrorState } from "./profile/ErrorState";
import { ProfileHeader } from "./profile/ProfileHeader";
import { 
  ReadOnlyNotice, 
  ReadOnlyEmploymentDetails, 
  ReadOnlySBUAssignments, 
  ReadOnlyManagement 
} from "./profile/ReadOnlyTabs";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser, isLoading: isAuthLoading, isAdmin } = useCurrentUser();
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
          locations (
            id,
            name
          ),
          employment_type_id,
          employment_types (
            id,
            name
          ),
          employee_role_id,
          employee_roles (
            id,
            name
          ),
          employee_type_id,
          employee_types (
            id,
            name
          ),
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

      // Process the data to add level, location, etc. as single values
      const processedData = {
        ...profileData,
        level: profileData.levels?.name || null,
        employment_type: profileData.employment_types?.name || null,
        employee_role: profileData.employee_roles?.name || null,
        employee_type: profileData.employee_types?.name || null,
        location: profileData.locations?.name || null,
        user_roles: roleData
      } as User;

      console.log("Processed user data:", processedData);
      return processedData;
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
    return <LoadingState />;
  }

  if (userError) {
    return <ErrorState message={userError.message} />;
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
      <ProfileHeader 
        handleSave={handleSave} 
        isLoading={updateProfileMutation.isPending} 
      />

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
          <ReadOnlyNotice isAdmin={isAdmin} />
          {isAdmin ? (
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
          ) : (
            <ReadOnlyEmploymentDetails user={profileUser} />
          )}
        </TabsContent>

        <TabsContent value="sbus">
          <ReadOnlyNotice isAdmin={isAdmin} />
          {isAdmin ? (
            profileUser && <SBUAssignmentTab user={profileUser} />
          ) : (
            <ReadOnlySBUAssignments user={profileUser} />
          )}
        </TabsContent>

        <TabsContent value="management">
          <ReadOnlyNotice isAdmin={isAdmin} />
          {isAdmin ? (
            profileUser && (
              <ManagementTab
                user={profileUser}
                supervisors={supervisors}
                onSupervisorChange={handleSupervisorChange}
                onPrimarySupervisorChange={handlePrimarySupervisorChange}
              />
            )
          ) : (
            <ReadOnlyManagement supervisors={supervisors} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
