import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoTab } from "../components/EditUserDialog/BasicInfoTab";
import { SBUAssignmentTab } from "../components/EditUserDialog/SBUAssignmentTab";
import { ManagementTab } from "../components/EditUserDialog/ManagementTab";
import { EmploymentDetailsTab } from "../components/EditUserDialog/EmploymentDetailsTab";
import { TeamTab } from "../components/EditUserDialog/TeamTab";
import { useProfileManagement } from "../hooks/useProfileManagement";
import { useSupervisorManagement } from "../hooks/useSupervisorManagement";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "../types";

export default function EditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
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
        .eq("id", id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      if (!profileData) {
        throw new Error("Profile not found");
      }

      console.info("Fetched profile data:", profileData);

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", id)
        .maybeSingle();

      if (roleError) throw roleError;

      if (!roleData) {
        throw new Error("User role not found");
      }

      return {
        ...profileData,
        user_roles: roleData
      } as User;
    },
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
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync();
      toast.success("User profile updated successfully");
      navigate("/admin/users");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update user profile");
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/users")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Edit User Profile</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/users")}>
            Cancel
          </Button>
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
          <TabsTrigger value="team">Team</TabsTrigger>
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

        <TabsContent value="team">
          {user && <TeamTab userId={user.id} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
