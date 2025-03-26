
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
import { InfoIcon } from "lucide-react";

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

  // Display a read-only notice for non-admin users on restricted tabs
  const ReadOnlyNotice = () => {
    if (!isAdmin) {
      return (
        <div className="bg-muted p-3 rounded-md flex items-center gap-2 mb-4">
          <InfoIcon className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            This information is read-only. Please contact an administrator if you need to make changes.
          </p>
        </div>
      );
    }
    return null;
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
          <ReadOnlyNotice />
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
            <div className="space-y-6 border p-6 rounded-md bg-background/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium mb-1">Designation</p>
                  <p className="text-muted-foreground">{designation || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Level</p>
                  <p className="text-muted-foreground">{profileUser.levels?.name || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Employment Type</p>
                  <p className="text-muted-foreground">{profileUser.employment_type_id || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Employee Role</p>
                  <p className="text-muted-foreground">{profileUser.employee_role_id || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Employee Type</p>
                  <p className="text-muted-foreground">{profileUser.employee_type_id || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Location</p>
                  <p className="text-muted-foreground">{profileUser.location_id || "Not specified"}</p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sbus">
          <ReadOnlyNotice />
          {isAdmin ? (
            profileUser && <SBUAssignmentTab user={profileUser} />
          ) : (
            <div className="space-y-6 border p-6 rounded-md bg-background/50">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">SBU Assignments</h3>
                {profileUser.user_sbus && profileUser.user_sbus.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {profileUser.user_sbus.map((sbu) => (
                      <div key={sbu.id} className="flex justify-between items-center p-2 border rounded-md">
                        <div className="flex flex-col">
                          <span>{sbu.sbu?.name}</span>
                          {sbu.is_primary && (
                            <span className="text-xs text-muted-foreground">Primary</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No SBUs assigned</p>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="management">
          <ReadOnlyNotice />
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
            <div className="space-y-6 border p-6 rounded-md bg-background/50">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Supervisors</h3>
                {supervisors && supervisors.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {supervisors.map((supervisor) => (
                      <div key={supervisor.id} className="p-2 border rounded-md">
                        <div className="flex flex-col">
                          <span>{supervisor.first_name} {supervisor.last_name}</span>
                          {supervisor.is_primary && (
                            <span className="text-xs text-muted-foreground">Primary Supervisor</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No supervisors assigned</p>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

