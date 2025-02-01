import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../../types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./UserAvatar";
import { UserHeader } from "./UserHeader";
import { UserStatusBadges } from "./UserStatusBadges";
import { UserStatusToggles } from "./UserStatusToggles";
import { UserEmploymentDetails } from "./UserEmploymentDetails";

interface UserCardProps {
  user: User;
  selected: boolean;
  onSelect: (userId: string, checked: boolean) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onRoleToggle: (userId: string, isAdmin: boolean) => void;
  onStatusToggle: (userId: string, isActive: boolean) => void;
}

export const UserCard = memo(function UserCard({
  user,
  selected,
  onSelect,
  onDelete,
  onRoleToggle,
  onStatusToggle,
}: UserCardProps) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(user.user_roles.role === "admin");
  const [isActive, setIsActive] = useState(user.status === "active");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const primarySbu = user.user_sbus?.find((sbu) => sbu.is_primary)?.sbu.name;
  const otherSbus = user.user_sbus?.filter(sbu => !sbu.is_primary).map(sbu => sbu.sbu.name);

  const getPrimaryManagerName = (supervisor: User['primary_supervisor']) => {
    if (supervisor === null || supervisor === undefined) return "N/A";
    const firstName = supervisor.first_name || "";
    const lastName = supervisor.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || "N/A";
  };

  const handleRoleToggle = async (checked: boolean) => {
    setIsUpdatingRole(true);
    setIsAdmin(checked);

    try {
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: checked ? 'admin' : 'user' })
        .eq('user_id', user.id);

      if (roleError) throw roleError;

      onRoleToggle(user.id, checked);
      toast.success(`User role updated to ${checked ? 'admin' : 'user'}`);
    } catch (error) {
      setIsAdmin(!checked);
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleStatusToggle = async (checked: boolean) => {
    setIsUpdatingStatus(true);
    setIsActive(checked);

    try {
      const { error } = await supabase.functions.invoke('toggle-user-status', {
        body: { 
          userId: user.id,
          status: checked ? 'active' : 'disabled'
        }
      });

      if (error) throw error;

      onStatusToggle(user.id, checked);
      toast.success(`User ${checked ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      setIsActive(!checked);
      console.error('Error updating status:', error);
      toast.error('Failed to update user status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleResetPassword = async () => {
    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast.success('Password reset email sent successfully');
    } catch (error) {
      console.error('Error sending reset password email:', error);
      toast.error('Failed to send reset password email');
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <Card 
      className={cn(
        "relative h-full transition-all duration-200 hover:shadow-md will-change-transform",
        selected ? 'ring-2 ring-primary scale-[1.02]' : '',
        !isActive && 'opacity-75'
      )}
    >
      <div className="absolute top-4 right-4 z-10">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(user.id, checked as boolean)}
          className="transition-transform duration-200 hover:scale-110"
        />
      </div>
      
      <CardHeader className="space-y-4">
        <div className="flex items-start gap-4">
          <UserAvatar
            profileImageUrl={user.profile_image_url}
            firstName={user.first_name}
            lastName={user.last_name}
          />
          <UserHeader user={user} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <UserStatusBadges isActive={isActive} isAdmin={isAdmin} />
            <UserStatusToggles
              isAdmin={isAdmin}
              isActive={isActive}
              isUpdatingRole={isUpdatingRole}
              isUpdatingStatus={isUpdatingStatus}
              onRoleToggle={handleRoleToggle}
              onStatusToggle={handleStatusToggle}
            />
          </div>

          <Separator />

          <UserEmploymentDetails
            user={user}
            primarySbu={primarySbu}
            otherSbus={otherSbus}
            primaryManagerName={getPrimaryManagerName(user.primary_supervisor)}
          />
        </div>
      </CardContent>

      <CardFooter className="justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0 transition-transform duration-200 hover:scale-110"
              disabled={isResettingPassword}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem 
              onClick={() => navigate(`/admin/users/${user.id}/edit`)}
              className="cursor-pointer"
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleResetPassword}
              className="cursor-pointer"
              disabled={isResettingPassword}
            >
              {isResettingPassword ? "Sending..." : "Reset Password"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={() => onDelete(user.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
});