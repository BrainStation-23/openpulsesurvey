
import { Button } from "@/components/ui/button";
import { TourButton } from "@/components/onboarding/TourButton";
import { UserRoundPlus, FilePlus2, FileSpreadsheet, Download } from "lucide-react";

interface UsersHeaderProps {
  onCreateUser: () => void;
  onBulkCreate: () => void;
  onBulkUpdate: () => void;
  onExportAll: () => void;
}

export function UsersHeader({
  onCreateUser,
  onBulkCreate,
  onBulkUpdate,
  onExportAll
}: UsersHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Users</h1>
        <TourButton tourId="users_management_guide" title="Users Guide" />
      </div>
      <div className="flex gap-2">
        <Button onClick={onCreateUser}>
          <UserRoundPlus className="mr-2 h-4 w-4"/>
          Add User
        </Button>
        <Button onClick={onBulkCreate} variant="outline">
          <FilePlus2 className="mr-2 h-4 w-4"/>
          Bulk Create Users
        </Button>
        <Button onClick={onBulkUpdate} variant="outline">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Bulk Update Users
        </Button>
        <Button onClick={onExportAll} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export All
        </Button>
      </div>
    </div>
  );
}
