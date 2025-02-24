
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BulkOperationsProps {
  selectedUsers: string[];
  onSuccess: () => void;
}

export function useBulkOperations() {
  const handleBulkDelete = async (selectedUsers: string[], onSuccess: () => void) => {
    try {
      for (const userId of selectedUsers) {
        const { error } = await supabase.functions.invoke('delete-user', {
          body: { user_id: userId }
        });
        if (error) throw error;
      }
      toast.success(`Successfully deleted ${selectedUsers.length} users`);
      onSuccess();
    } catch (error) {
      toast.error("Failed to delete selected users");
    }
  };

  const handleBulkStatusToggle = async (selectedUsers: string[], onSuccess: () => void) => {
    try {
      const { data: firstUser } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', selectedUsers[0])
        .single();

      const newStatus = firstUser?.status === 'active' ? 'disabled' : 'active';

      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .in('id', selectedUsers);

      if (error) throw error;

      toast.success(
        `Successfully ${newStatus === 'active' ? 'activated' : 'deactivated'} ${selectedUsers.length} users`
      );
      
      onSuccess();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error("Failed to update user status");
    }
  };

  return {
    handleBulkDelete,
    handleBulkStatusToggle
  };
}
