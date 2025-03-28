
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoTab } from "@/pages/admin/users/components/EditUserDialog/BasicInfoTab";
import { SBUAssignmentTab } from "@/pages/admin/users/components/EditUserDialog/SBUAssignmentTab";
import { ManagementTab } from "@/pages/admin/users/components/EditUserDialog/ManagementTab";
import { EmploymentDetailsTab } from "@/pages/admin/users/components/EditUserDialog/EmploymentDetailsTab";
import { User } from "@/pages/admin/users/types";
import { 
  ReadOnlyNotice, 
  ReadOnlyEmploymentDetails, 
  ReadOnlySBUAssignments, 
  ReadOnlyManagement 
} from "./ReadOnlyTabs";
import { GenderType } from "@/pages/admin/users/types";

interface ProfileTabsProps {
  profileUser: User;
  isAdmin: boolean;
  supervisors: any[];
  formControls: {
    firstName: string;
    setFirstName: (value: string) => void;
    lastName: string;
    setLastName: (value: string) => void;
    profileImageUrl: string;
    setProfileImageUrl: (value: string) => void;
    orgId: string;
    setOrgId: (value: string) => void;
    gender: GenderType;
    setGender: (value: GenderType) => void;
    dateOfBirth: Date | undefined;
    setDateOfBirth: (value: Date | undefined) => void;
    designation: string;
    setDesignation: (value: string) => void;
    selectedLocation: string;
    setSelectedLocation: (value: string) => void;
    selectedEmploymentType: string;
    setSelectedEmploymentType: (value: string) => void;
    selectedLevel: string;
    setSelectedLevel: (value: string) => void;
    selectedEmployeeRole: string;
    setSelectedEmployeeRole: (value: string) => void;
    selectedEmployeeType: string;
    setSelectedEmployeeType: (value: string) => void;
  };
  handlers: {
    handleSupervisorChange: (supervisorId: string, action: "add" | "remove") => void;
    handlePrimarySupervisorChange: (supervisorId: string) => void;
  };
}

export const ProfileTabs = ({
  profileUser,
  isAdmin,
  supervisors,
  formControls,
  handlers
}: ProfileTabsProps) => {
  const {
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
    setSelectedEmployeeType
  } = formControls;

  const {
    handleSupervisorChange,
    handlePrimarySupervisorChange
  } = handlers;

  return (
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
  );
};
