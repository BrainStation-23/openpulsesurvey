
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CampaignStatusProps {
  status: string;
  isEditing: boolean;
  canEditStatus: boolean;
  editedStatus: string;
  onStatusChange: (value: string) => void;
}

export function CampaignStatus({
  status,
  isEditing,
  canEditStatus,
  editedStatus,
  onStatusChange,
}: CampaignStatusProps) {
  if (isEditing && canEditStatus) {
    return (
      <Select
        value={editedStatus}
        onValueChange={onStatusChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="active">Active</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <Badge variant={status === 'active' ? 'default' : 'secondary'}>
      {status}
    </Badge>
  );
}
