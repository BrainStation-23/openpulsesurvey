
import { useState } from "react";
import { toast } from "sonner";
import { exportAllUsers } from "../utils/exportUsers";

export interface ExportProgress {
  isOpen: boolean;
  processed: number;
  total: number;
  error: string;
  isComplete: boolean;
}

export function useExportOperations() {
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    isOpen: false,
    processed: 0,
    total: 0,
    error: "",
    isComplete: false
  });

  const handleExportAll = async () => {
    try {
      setExportProgress({
        isOpen: true,
        processed: 0,
        total: 0,
        error: "",
        isComplete: false
      });

      await exportAllUsers((processed, total) => {
        setExportProgress(prev => ({
          ...prev,
          processed,
          total
        }));
      });

      setExportProgress(prev => ({
        ...prev,
        isComplete: true
      }));

      toast.success("Successfully exported all users");
    } catch (error) {
      console.error("Error exporting all users:", error);
      setExportProgress(prev => ({
        ...prev,
        error: "Failed to export users"
      }));
      toast.error("Failed to export all users");
    }
  };

  return {
    exportProgress,
    setExportProgress,
    handleExportAll
  };
}
