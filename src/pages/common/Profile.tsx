
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

  const formControls = {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    profileImageUrl,
    setProfileImageUrl,
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
    selectedLevel,
    setSelectedLevel,
    selectedEmployeeRole,
    setSelectedEmployeeRole,
    selectedEmployeeType,
    setSelectedEmployeeType,
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
