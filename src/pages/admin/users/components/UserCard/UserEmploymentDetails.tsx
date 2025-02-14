
import { Building, Briefcase, Users, MapPin, User as UserIcon } from "lucide-react";
import { User } from "../../types";

interface UserEmploymentDetailsProps {
  user: User;
  primarySbu?: string | null;
  otherSbus?: string[];
  primaryManagerName: string;
}

export const UserEmploymentDetails = ({
  user,
  primarySbu,
  otherSbus,
  primaryManagerName,
}: UserEmploymentDetailsProps) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[24px_100px_1fr] items-center gap-2 text-sm">
        <Building className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Primary SBU:</span>
        <span className="font-medium truncate">{primarySbu || "N/A"}</span>
      </div>

      <div className="grid grid-cols-[24px_100px_1fr] items-center gap-2 text-sm">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Manager:</span>
        <span className="font-medium truncate">{primaryManagerName}</span>
      </div>

      <div className="grid grid-cols-[24px_100px_1fr] items-center gap-2 text-sm">
        <Briefcase className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Designation:</span>
        <span className="font-medium truncate">{user.designation || "N/A"}</span>
      </div>

      <div className="grid grid-cols-[24px_100px_1fr] items-center gap-2 text-sm">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Location:</span>
        <span className="font-medium truncate">{user.location || "N/A"}</span>
      </div>

      <div className="grid grid-cols-[24px_100px_1fr] items-center gap-2 text-sm">
        <Briefcase className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Employment:</span>
        <span className="font-medium truncate">{user.employment_type || "N/A"}</span>
      </div>

      <div className="grid grid-cols-[24px_100px_1fr] items-center gap-2 text-sm">
        <UserIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Role:</span>
        <span className="font-medium truncate">{user.employee_role || "N/A"}</span>
      </div>

      <div className="grid grid-cols-[24px_100px_1fr] items-center gap-2 text-sm">
        <UserIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Type:</span>
        <span className="font-medium truncate">{user.employee_type || "N/A"}</span>
      </div>

      <div className="grid grid-cols-[24px_100px_1fr] items-center gap-2 text-sm">
        <UserIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Level:</span>
        <span className="font-medium truncate">{user.level || "N/A"}</span>
      </div>
    </div>
  );
};
