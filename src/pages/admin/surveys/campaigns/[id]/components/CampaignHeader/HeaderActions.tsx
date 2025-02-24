
import { Button } from "@/components/ui/button";
import { TourButton } from "@/components/onboarding/TourButton";
import { Check, Edit2, Play, X } from "lucide-react";

interface HeaderActionsProps {
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onPresent: () => void;
  isDisabled: boolean;
}

export function HeaderActions({
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onPresent,
  isDisabled,
}: HeaderActionsProps) {
  return (
    <div className="flex gap-2">
      <TourButton tourId="campaign_details_guide" title="Campaign Details Guide" />
      <Button
        onClick={onPresent}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Play className="h-4 w-4" />
        Present
      </Button>
      {isEditing ? (
        <>
          <Button onClick={onCancel} variant="outline" size="sm">
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={onSave} size="sm">
            <Check className="mr-2 h-4 w-4" />
            Save
          </Button>
        </>
      ) : (
        <Button
          onClick={onEdit}
          variant="outline"
          size="sm"
          disabled={isDisabled}
        >
          <Edit2 className="mr-2 h-4 w-4" />
          Edit
        </Button>
      )}
    </div>
  );
}
