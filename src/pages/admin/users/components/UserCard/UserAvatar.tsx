import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  profileImageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export const UserAvatar = ({ profileImageUrl, firstName, lastName }: UserAvatarProps) => {
  return (
    <Avatar className="h-16 w-16 ring-2 ring-background transition-transform duration-200 hover:scale-110">
      <AvatarImage src={profileImageUrl || undefined} />
      <AvatarFallback className="bg-primary/10 text-lg">
        {firstName?.[0]}{lastName?.[0]}
      </AvatarFallback>
    </Avatar>
  );
};