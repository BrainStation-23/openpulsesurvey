
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useExportOperations() {
  const handleExportAll = async () => {
    try {
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
        console.error("Export error:", error);
        toast.error("Failed to export all users");
        return;
      }

      // Convert the response to a blob and trigger download
      if (typeof data === 'string') {
        const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `users_export_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("Successfully exported all users");
      } else {
        console.error("Unexpected data format:", data);
        toast.error("Failed to export all users: Unexpected response format");
      }
    } catch (error: any) {
      console.error("Export exception:", error);
      toast.error("Failed to export all users");
    }
  };

  return {
    handleExportAll
  };
}
