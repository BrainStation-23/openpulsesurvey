
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

      // Get the current user session for authentication
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("You must be logged in to export users");
      }

      // Use supabase.functions.invoke for the edge function call
      const { data, error } = await supabase.functions.invoke("export_all_users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (error) {
        setExportProgress(prev => ({
          ...prev,
          error: error.message || "Failed to export users"
        }));
        toast.error("Failed to export all users");
        return;
      }

      // Since we can't specify responseType directly, we need to manually convert the response to a blob
      // The data is already returned, we just need to create a blob from it
      const blob = new Blob([data as string], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `users_export_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setExportProgress(prev => ({
        ...prev,
        isComplete: true
      }));
      toast.success("Successfully exported all users");
    } catch (error: any) {
      setExportProgress(prev => ({
        ...prev,
        error: error.message || "Failed to export users"
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
