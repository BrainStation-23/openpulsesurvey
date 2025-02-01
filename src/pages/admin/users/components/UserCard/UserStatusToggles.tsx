import { Switch } from "@/components/ui/switch";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserStatusTogglesProps {
  isAdmin: boolean;
  isActive: boolean;
  isUpdatingRole: boolean;
  isUpdatingStatus: boolean;
  onRoleToggle: (checked: boolean) => void;
  onStatusToggle: (checked: boolean) => void;
}

export const UserStatusToggles = ({
  isAdmin,
  isActive,
  isUpdatingRole,
  isUpdatingStatus,
  onRoleToggle,
  onStatusToggle,
}: UserStatusTogglesProps) => {
  return (
    <div className="flex items-center gap-4 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">Admin</span>
        <div className="relative">
          <Switch
            checked={isAdmin}
            onCheckedChange={onRoleToggle}
            disabled={isUpdatingRole}
            className={cn(
              "transition-opacity duration-200 hover:opacity-80",
              isUpdatingRole && "opacity-50"
            )}
          />
          {isUpdatingRole && (
            <Loader className="absolute right-[-24px] top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">Active</span>
        <div className="relative">
          <Switch
            checked={isActive}
            onCheckedChange={onStatusToggle}
            disabled={isUpdatingStatus}
            className={cn(
              "transition-opacity duration-200 hover:opacity-80",
              isUpdatingStatus && "opacity-50"
            )}
          />
          {isUpdatingStatus && (
            <Loader className="absolute right-[-24px] top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
          )}
        </div>
      </div>
    </div>
  );
};