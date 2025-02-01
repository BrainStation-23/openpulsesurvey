import { Building, Briefcase, Users, MapPin, GraduationCap } from "lucide-react";
import { User } from "../../types";

interface UserEmploymentDetailsProps {
  user: User;
  primarySbu?: string;
  otherSbus?: string[];
  primaryManagerName: string;
}

export const UserEmploymentDetails = ({ 
  user, 
  primarySbu,
  otherSbus,
  primaryManagerName 
}: UserEmploymentDetailsProps) => {
  return (
    <div className="grid gap-3">
      {primarySbu && (
        <div className="flex items-center gap-2 text-sm">
          <Building className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground whitespace-nowrap">Primary SBU:</span>
          <span className="font-medium truncate">{primarySbu}</span>
        </div>
      )}
      {otherSbus && otherSbus.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <Building className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground whitespace-nowrap">Other SBUs:</span>
          <span className="font-medium truncate">{otherSbus.join(", ")}</span>
        </div>
      )}
      <div className="flex items-center gap-2 text-sm">
        <Users className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-muted-foreground whitespace-nowrap">Primary Manager:</span>
        <span className="font-medium truncate">{primaryManagerName}</span>
      </div>
      {user.designation && (
        <div className="flex items-center gap-2 text-sm">
          <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground whitespace-nowrap">Designation:</span>
          <span className="font-medium truncate">{user.designation}</span>
        </div>
      )}
      {user.level && (
        <div className="flex items-center gap-2 text-sm">
          <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground whitespace-nowrap">Level:</span>
          <span className="font-medium truncate">{user.level}</span>
        </div>
      )}
      {user.location && (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground whitespace-nowrap">Location:</span>
          <span className="font-medium truncate">{user.location}</span>
        </div>
      )}
      {user.employment_type && (
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground whitespace-nowrap">Employment Type:</span>
          <span className="font-medium truncate">{user.employment_type}</span>
        </div>
      )}
      {user.employee_role && (
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground whitespace-nowrap">Employee Role:</span>
          <span className="font-medium truncate">{user.employee_role}</span>
        </div>
      )}
      {user.employee_type && (
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground whitespace-nowrap">Employee Type:</span>
          <span className="font-medium truncate">{user.employee_type}</span>
        </div>
      )}
    </div>
  );
};