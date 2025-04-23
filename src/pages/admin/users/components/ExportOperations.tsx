
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
        },
        responseType: "blob", // <- important for CSV or file downloads!
      });

      if (error) {
        setExportProgress(prev => ({
          ...prev,
          error: error.message || "Failed to export users"
        }));
        toast.error("Failed to export all users");
        return;
      }

      // For file download, data will be a Blob when using responseType: "blob"
      if (data instanceof Blob) {
        const url = window.URL.createObjectURL(data);
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
      } else {
        setExportProgress(prev => ({
          ...prev,
          error: "Export failed: Unexpected response format"
        }));
        toast.error("Failed to export all users");
      }
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
