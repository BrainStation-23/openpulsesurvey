
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useProfileManagement } from "@/pages/admin/users/hooks/useProfileManagement";
import { useSupervisorManagement } from "@/pages/admin/users/hooks/useSupervisorManagement";
import { LoadingState } from "./profile/LoadingState";
import { ErrorState } from "./profile/ErrorState";
import { ProfileHeader } from "./profile/ProfileHeader";
import { ProfileTabs } from "./profile/ProfileTabs";
import { ProfileNotFound } from "./profile/ProfileNotFound";
import { useProfileData } from "./profile/useProfileData";
import { GenderType } from "@/pages/admin/users/types";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useCurrentUser();
  const { profileUser, isLoading, userError } = useProfileData();

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

  if (isLoading) {
    return <LoadingState />;
  }

  if (userError) {
    return <ErrorState message={userError.message} />;
  }

  if (!profileUser) {
    return <ProfileNotFound />;
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

  // Create properly typed wrappers for form controls
  const formControls = {
    firstName,
    setFirstName: (value: string) => setFirstName(value),
    lastName,
    setLastName: (value: string) => setLastName(value),
    profileImageUrl,
    setProfileImageUrl: (value: string) => setProfileImageUrl(value),
    orgId,
    setOrgId: (value: string) => setOrgId(value),
    gender,
    setGender: (value: GenderType) => setGender(value),
    dateOfBirth,
    setDateOfBirth: (value: Date | undefined) => setDateOfBirth(value),
    designation,
    setDesignation: (value: string) => setDesignation(value),
    selectedLocation,
    setSelectedLocation: (value: string) => setSelectedLocation(value),
    selectedEmploymentType,
    setSelectedEmploymentType: (value: string) => setSelectedEmploymentType(value),
    selectedLevel,
    setSelectedLevel: (value: string) => setSelectedLevel(value),
    selectedEmployeeRole,
    setSelectedEmployeeRole: (value: string) => setSelectedEmployeeRole(value),
    selectedEmployeeType,
    setSelectedEmployeeType: (value: string) => setSelectedEmployeeType(value),
  };

  const handlers = {
    handleSupervisorChange,
    handlePrimarySupervisorChange,
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ProfileHeader 
        handleSave={handleSave} 
        isLoading={updateProfileMutation.isPending} 
      />

      <ProfileTabs 
        profileUser={profileUser}
        isAdmin={isAdmin}
        supervisors={supervisors}
        formControls={formControls}
        handlers={handlers}
      />
    </div>
  );
}
