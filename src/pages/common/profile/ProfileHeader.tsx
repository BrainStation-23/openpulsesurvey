
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  handleSave: () => Promise<void>;
  isLoading: boolean;
}

export const ProfileHeader = ({ handleSave, isLoading }: ProfileHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={isLoading}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};
