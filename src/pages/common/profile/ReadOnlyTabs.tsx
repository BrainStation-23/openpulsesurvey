
import { User } from "@/pages/admin/users/types";

interface ReadOnlyNoticeProps {
  isAdmin: boolean;
}

export const ReadOnlyNotice = ({ isAdmin }: ReadOnlyNoticeProps) => {
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

export const ReadOnlyEmploymentDetails = ({ user }: { user: User }) => {
  return (
    <div className="space-y-6 border p-6 rounded-md bg-background/50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium mb-1">Designation</p>
          <p className="text-muted-foreground">{user.designation || "Not specified"}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Level</p>
          <p className="text-muted-foreground">{user.level || "Not specified"}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Employment Type</p>
          <p className="text-muted-foreground">{user.employment_type || "Not specified"}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Employee Role</p>
          <p className="text-muted-foreground">{user.employee_role || "Not specified"}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Employee Type</p>
          <p className="text-muted-foreground">{user.employee_type || "Not specified"}</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Location</p>
          <p className="text-muted-foreground">{user.location || "Not specified"}</p>
        </div>
      </div>
    </div>
  );
};

export const ReadOnlySBUAssignments = ({ user }: { user: User }) => {
  return (
    <div className="space-y-6 border p-6 rounded-md bg-background/50">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">SBU Assignments</h3>
        {user.user_sbus && user.user_sbus.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {user.user_sbus.map((sbu) => (
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
  );
};

export const ReadOnlyManagement = ({ supervisors }: { supervisors: any[] }) => {
  return (
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
  );
};

import { InfoIcon } from "lucide-react";
