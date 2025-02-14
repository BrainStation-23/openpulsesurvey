import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { User } from "../../types";

interface UserHeaderProps {
  user: User;
}

export const UserHeader = ({ user }: UserHeaderProps) => {
  return (
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-lg leading-none truncate">
        {user.first_name} {user.last_name}
      </h3>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
        <Mail className="h-4 w-4 shrink-0" />
        <span className="truncate">{user.email}</span>
      </div>
      {user.org_id && (
        <Badge variant="outline" className="mt-2">
          ID: {user.org_id}
        </Badge>
      )}
    </div>
  );
};