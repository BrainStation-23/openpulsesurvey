
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { UserHeader } from "./UserHeader";
import { UserStatusBadges } from "./UserStatusBadges";
import { UserStatusToggles } from "./UserStatusToggles";
import { UserEmploymentDetails } from "./UserEmploymentDetails";
import { User } from "../../types";

interface UserCardProps {
  user: User;
  isUpdatingRole: boolean;
  isUpdatingStatus: boolean;
  onRoleToggle: (checked: boolean) => void;
  onStatusToggle: (checked: boolean) => void;
}

export function UserCard({
  user,
  isUpdatingRole,
  isUpdatingStatus,
  onRoleToggle,
  onStatusToggle,
}: UserCardProps) {
  const primarySbu = user.user_sbus?.find((sbu) => sbu.is_primary)?.sbu.name;
  const otherSbus = user.user_sbus
    ?.filter((sbu) => !sbu.is_primary)
    .map((sbu) => sbu.sbu.name);
  
  const primaryManagerName = user.primary_supervisor
    ? `${user.primary_supervisor.first_name} ${user.primary_supervisor.last_name}`
    : "Not Assigned";

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar Section */}
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={user.avatar_url || ""}
              alt={`${user.first_name} ${user.last_name}`}
            />
            <AvatarFallback className="text-lg">
              {user.first_name?.[0]}
              {user.last_name?.[0]}
            </AvatarFallback>
          </Avatar>

          {/* Main Content Section */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Header Section with Name, Email, and Status Badges */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <UserHeader user={user} />
                <UserStatusBadges
                  isActive={user.status === "active"}
                  isAdmin={user.user_roles?.role === "admin"}
                />
              </div>
              <UserStatusToggles
                isAdmin={user.user_roles?.role === "admin"}
                isActive={user.status === "active"}
                isUpdatingRole={isUpdatingRole}
                isUpdatingStatus={isUpdatingStatus}
                onRoleToggle={onRoleToggle}
                onStatusToggle={onStatusToggle}
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Employment Details Section */}
            <UserEmploymentDetails
              user={user}
              primarySbu={primarySbu}
              otherSbus={otherSbus}
              primaryManagerName={primaryManagerName}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
