
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function LoadingView() {
  return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner />
    </div>
  );
}
