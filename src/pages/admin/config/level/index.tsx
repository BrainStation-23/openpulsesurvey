
import { ConfigPage } from "../shared/ConfigPage";
import { TourButton } from "@/components/onboarding/TourButton";
import { useLevelManagement } from "./hooks/useLevelManagement";

export default function LevelConfig() {
  const {
    levels,
    isLoading,
    sortOrder,
    handleSort,
    createMutation,
    updateMutation,
    deleteMutation,
    toggleStatusMutation,
    reorderMutation,
  } = useLevelManagement();

  return (
    <div className="config-level space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Levels</h2>
        <TourButton tourId="level_config" title="Level Configuration Guide" />
      </div>
      <ConfigPage
        title="Levels"
        items={levels || []}
        isLoading={isLoading}
        sortOrder={sortOrder}
        onSort={handleSort}
        onCreate={createMutation.mutate}
        onUpdate={(id, values) => updateMutation.mutate({ id, ...values })}
        onDelete={deleteMutation.mutate}
        onToggleStatus={(id, newStatus) => toggleStatusMutation.mutate({ id, newStatus })}
        onReorder={reorderMutation.mutate}
        draggable={true}
      />
    </div>
  );
}
