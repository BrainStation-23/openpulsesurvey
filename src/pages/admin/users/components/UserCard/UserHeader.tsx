
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { User } from "../../types";

interface UserHeaderProps {
  user: User;
}

export const UserHeader = ({ user }: UserHeaderProps) => {
  return (
    <div className="space-y-1">
      <h3 className="text-lg font-semibold leading-none">
        {user.first_name} {user.last_name}
      </h3>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Mail className="h-4 w-4 shrink-0" />
        <span className="truncate">{user.email}</span>
      </div>
      {user.org_id && (
        <Badge variant="outline" className="mt-1">
          ID: {user.org_id}
        </Badge>
      )}
    </div>
  );
};
