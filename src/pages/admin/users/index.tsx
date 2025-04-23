import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { User } from "./types";
import { useUsers } from "./hooks/useUsers";
import { useUserActions } from "./hooks/useUserActions";
import { useSBUs } from "./hooks/useSBUs";
import { useFilterOptions } from "./hooks/useFilterOptions";
import { UserGrid } from "./components/UserGrid";
import { UsersHeader } from "./components/UsersHeader";
import CreateUserDialog from "./components/CreateUserDialog";
import EditUserDialog from "./components/EditUserDialog";
import { SearchFilters } from "./components/UserTable/SearchFilters";
import { ImportDialog } from "./components/ImportDialog";
import { BulkUpdateDialog } from "./components/BulkUpdateDialog";
import { useUserFilters } from "./hooks/useUserFilters";
import { useBulkOperations } from "./components/BulkOperations";
import { useExportOperations } from "./components/ExportOperations";
import { useQueryClient } from "@tanstack/react-query";

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSBU, setSelectedSBU] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState("all");
  const [selectedEmployeeRole, setSelectedEmployeeRole] = useState("all");
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const queryClient = useQueryClient();

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedSBU, selectedLevel, selectedLocation, 
      selectedEmploymentType, selectedEmployeeRole, selectedEmployeeType, pageSize]);

  const { data, isLoading, refetch } = useUsers({
    currentPage,
    pageSize,
    searchTerm: debouncedSearch,
    selectedSBU,
    selectedLevel,
    selectedLocation,
    selectedEmploymentType,
    selectedEmployeeRole,
    selectedEmployeeType
  });

  const { data: sbus = [] } = useSBUs();
  const { 
    levels,
    locations,
    employmentTypes,
    employeeRoles,
    employeeTypes,
    isLoading: isLoadingFilters
  } = useFilterOptions();
  const { handleCreateSuccess, handleDelete } = useUserActions(refetch);
  const { handleBulkDelete, handleBulkStatusToggle } = useBulkOperations();
  const { handleExportAll } = useExportOperations();

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  const { filteredUsers } = useUserFilters(data?.users || [], selectedSBU);

  const handleImportComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  return (
    <div className="container mx-auto py-6 space-y-4">
      <UsersHeader
        onCreateUser={() => setIsCreateDialogOpen(true)}
        onBulkCreate={() => setIsImportDialogOpen(true)}
        onBulkUpdate={() => setIsUpdateDialogOpen(true)}
        onExportAll={handleExportAll}
      />

      <div className="space-y-4">
        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedSBU={selectedSBU}
          selectedLevel={selectedLevel}
          selectedLocation={selectedLocation}
          selectedEmploymentType={selectedEmploymentType}
          selectedEmployeeRole={selectedEmployeeRole}
          selectedEmployeeType={selectedEmployeeType}
          setSelectedSBU={setSelectedSBU}
          setSelectedLevel={setSelectedLevel}
          setSelectedLocation={setSelectedLocation}
          setSelectedEmploymentType={setSelectedEmploymentType}
          setSelectedEmployeeRole={setSelectedEmployeeRole}
          setSelectedEmployeeType={setSelectedEmployeeType}
          sbus={sbus}
          levels={levels}
          locations={locations}
          employmentTypes={employmentTypes}
          employeeRoles={employeeRoles}
          employeeTypes={employeeTypes}
          totalResults={data?.total}
          isSearching={isLoading || isLoadingFilters}
          onBulkCreate={() => setIsImportDialogOpen(true)}
        />

        <UserGrid
          users={data?.users || []}
          selectedUsers={selectedUsers}
          onSelectUser={(userId, checked) => {
            if (checked) {
              setSelectedUsers(prev => [...prev, userId]);
            } else {
              setSelectedUsers(prev => prev.filter(id => id !== userId));
            }
          }}
          onEdit={setSelectedUser}
          onDelete={handleDelete}
          onRoleToggle={() => {}}
          onStatusToggle={() => {}}
          onBulkStatusToggle={() => handleBulkStatusToggle(selectedUsers, () => {
            setSelectedUsers([]);
            refetch();
          })}
          onBulkDelete={() => handleBulkDelete(selectedUsers, () => {
            setSelectedUsers([]);
            refetch();
          })}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
      </div>

      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <EditUserDialog
        user={selectedUser}
        open={!!selectedUser}
        onOpenChange={(open) => !open && setSelectedUser(null)}
      />

      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={() => {
          refetch();
          setIsImportDialogOpen(false);
        }}
      />

      <BulkUpdateDialog
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        onUpdateComplete={() => {
          refetch();
          setIsUpdateDialogOpen(false);
        }}
      />
    </div>
  );
}
