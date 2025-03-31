
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ObjectiveAccessPermissionProps {
  userId?: string;
  objectiveId?: string;
}

export const useObjectiveAccessPermission = ({ userId, objectiveId }: ObjectiveAccessPermissionProps) => {
  const [canView, setCanView] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canComment, setCanComment] = useState(false);

  const { data: viewPermission, isLoading: viewLoading } = useQuery({
    queryKey: ['objective-view-permission', objectiveId, userId],
    queryFn: async () => {
      if (!userId || !objectiveId) return false;
      
      const { data, error } = await supabase.rpc('check_okr_objective_access', {
        p_user_id: userId,
        p_objective_id: objectiveId,
        p_access_type: 'view'
      });
      
      if (error) {
        console.error('Error checking view permission:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!objectiveId && !!userId
  });

  const { data: editPermission, isLoading: editLoading } = useQuery({
    queryKey: ['objective-edit-permission', objectiveId, userId],
    queryFn: async () => {
      if (!userId || !objectiveId) return false;
      
      const { data, error } = await supabase.rpc('check_okr_objective_access', {
        p_user_id: userId,
        p_objective_id: objectiveId,
        p_access_type: 'edit'
      });
      
      if (error) {
        console.error('Error checking edit permission:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!objectiveId && !!userId
  });

  const { data: commentPermission, isLoading: commentLoading } = useQuery({
    queryKey: ['objective-comment-permission', objectiveId, userId],
    queryFn: async () => {
      if (!userId || !objectiveId) return false;
      
      const { data, error } = await supabase.rpc('check_okr_objective_access', {
        p_user_id: userId,
        p_objective_id: objectiveId,
        p_access_type: 'comment'
      });
      
      if (error) {
        console.error('Error checking comment permission:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!objectiveId && !!userId
  });

  useEffect(() => {
    if (viewPermission !== undefined) {
      setCanView(viewPermission);
    }
  }, [viewPermission]);

  useEffect(() => {
    if (editPermission !== undefined) {
      setCanEdit(editPermission);
    }
  }, [editPermission]);

  useEffect(() => {
    if (commentPermission !== undefined) {
      setCanComment(commentPermission);
    }
  }, [commentPermission]);

  return {
    canView,
    canEdit,
    canComment,
    isLoading: viewLoading || editLoading || commentLoading
  };
};
