
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SurveyAssignment } from "@/pages/admin/surveys/types/assignments";

const statusStyles = {
  submitted: "bg-green-100 text-green-800 border border-green-200",
  expired: "bg-red-100 text-red-800 border border-red-200",
  in_progress: "bg-blue-100 text-blue-800 border border-blue-200",
  assigned: "bg-gray-100 text-gray-800 border border-gray-200",
};

interface UserCellProps {
  assignment: SurveyAssignment;
}

export function UserCell({ assignment }: UserCellProps) {
  const user = assignment.user;
  return (
    <div className="flex items-center gap-2">
      <div>
        <div className="font-medium flex items-center gap-2">
          {user.first_name} {user.last_name}
          <Badge className={cn("text-xs", statusStyles[assignment.status])}>
            {assignment.status.replace(/_/g, " ")}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">{user.email}</div>
      </div>
    </div>
  );
}
