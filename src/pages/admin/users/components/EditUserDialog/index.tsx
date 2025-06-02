
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "../../types";
import { BasicInfoTab } from "./BasicInfoTab";
import { SBUAssignmentTab } from "./SBUAssignmentTab";
import { ManagementTab } from "./ManagementTab";
import { EmploymentDetailsTab } from "./EmploymentDetailsTab";
import { TeamTab } from "./TeamTab";
import { useProfileManagement } from "../../hooks/useProfileManagement";
import { useSupervisorManagement } from "../../hooks/useSupervisorManagement";

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditUserDialog({
  user,
  open,
  onOpenChange,
}: EditUserDialogProps) {
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
    profileError,
    updateProfileMutation,
  } = useProfileManagement(user);

  const {
    supervisors,
    handleSupervisorChange,
    handlePrimarySupervisorChange,
  } = useSupervisorManagement(user);

  const handleSave = () => {
    updateProfileMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

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

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
