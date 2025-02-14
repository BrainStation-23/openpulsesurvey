
import { Badge } from "@/components/ui/badge";

interface UserStatusBadgesProps {
  isActive: boolean;
  isAdmin: boolean;
}

export const UserStatusBadges = ({ isActive, isAdmin }: UserStatusBadgesProps) => {
  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={isActive ? "default" : "secondary"}
        className="px-2 py-0.5 text-xs font-medium"
      >
        {isActive ? "Active" : "Inactive"}
      </Badge>
      <Badge 
        variant={isAdmin ? "destructive" : "outline"}
        className="px-2 py-0.5 text-xs font-medium"
      >
        {isAdmin ? "Admin" : "User"}
      </Badge>
    </div>
  );
};
