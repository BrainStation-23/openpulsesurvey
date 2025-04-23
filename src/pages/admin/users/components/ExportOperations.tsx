
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

const SUPABASE_EDGE_URL = "https://bdnbcaiqgumzsujkbsmp.functions.supabase.co/export_all_users";

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

      // Call the edge function and handle download
      const resp = await fetch(SUPABASE_EDGE_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!resp.ok) {
        const error = await resp.text();
        setExportProgress(prev => ({
          ...prev,
          error: error || "Failed to export users"
        }));
        toast.error("Failed to export all users");
        return;
      }

      const blob = await resp.blob();
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
