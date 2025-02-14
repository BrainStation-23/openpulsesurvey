import { Badge } from "@/components/ui/badge";

interface UserStatusBadgesProps {
  isActive: boolean;
  isAdmin: boolean;
}

export const UserStatusBadges = ({ isActive, isAdmin }: UserStatusBadgesProps) => {
  return (
    <div className="flex items-center gap-2">
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
      <Badge variant={isAdmin ? "destructive" : "outline"}>
        {isAdmin ? "Admin" : "User"}
      </Badge>
    </div>
  );
};