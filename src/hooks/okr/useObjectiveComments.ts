
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  objectiveId?: string;
  keyResultId?: string;
  parentCommentId?: string | null;
  creatorName?: string;
  creatorProfileImage?: string;
  replies?: Comment[];
}

interface CreateCommentInput {
  content: string;
  objectiveId?: string;
  keyResultId?: string;
  parentCommentId?: string;
}

interface UpdateCommentInput {
  id: string;
  content: string;
}

export const useObjectiveComments = (objectiveId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});

  const toggleCommentExpansion = (commentId: string) => {
    setIsExpanded(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // Fetch comments
  const { data: comments, isLoading, error, refetch } = useQuery({
    queryKey: ['objective-comments', objectiveId],
    queryFn: async () => {
      if (!objectiveId) return [];
      
      // Fetch all comments for this objective
      const { data: comments, error } = await supabase
        .from('okr_comments')
        .select(`
          id, 
          content, 
          created_at,
          updated_at,
          created_by,
          objective_id,
          key_result_id,
          parent_comment_id,
          profiles:created_by (
            first_name,
            last_name,
            profile_image_url
          )
        `)
        .eq('objective_id', objectiveId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }
      
      // Transform to our Comment interface with proper nesting for replies
      const formattedComments: Comment[] = comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        createdBy: comment.created_by,
        objectiveId: comment.objective_id,
        keyResultId: comment.key_result_id,
        parentCommentId: comment.parent_comment_id,
        creatorName: comment.profiles ? 
          `${comment.profiles.first_name || ''} ${comment.profiles.last_name || ''}`.trim() : 
          'Unknown User',
        creatorProfileImage: comment.profiles?.profile_image_url,
        replies: []
      }));
      
      // Create a lookup map for parent comments
      const commentMap: Record<string, Comment> = {};
      const rootComments: Comment[] = [];
      
      formattedComments.forEach(comment => {
        commentMap[comment.id] = comment;
        if (!comment.parentCommentId) {
          rootComments.push(comment);
        }
      });
      
      // Nest reply comments under their parents
      formattedComments.forEach(comment => {
        if (comment.parentCommentId && commentMap[comment.parentCommentId]) {
          if (!commentMap[comment.parentCommentId].replies) {
            commentMap[comment.parentCommentId].replies = [];
          }
          commentMap[comment.parentCommentId].replies!.push(comment);
        }
      });
      
      return rootComments;
    },
    enabled: !!objectiveId
  });

  // Create comment mutation
  const createComment = useMutation({
    mutationFn: async (input: CreateCommentInput) => {
      const { data, error } = await supabase
        .from('okr_comments')
        .insert({
          content: input.content,
          objective_id: input.objectiveId,
          key_result_id: input.keyResultId,
          parent_comment_id: input.parentCommentId,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objective-comments', objectiveId] });
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post comment: " + (error as Error).message,
        variant: "destructive"
      });
    }
  });

  // Update comment mutation
  const updateComment = useMutation({
    mutationFn: async (input: UpdateCommentInput) => {
      const { data, error } = await supabase
        .from('okr_comments')
        .update({
          content: input.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', input.id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objective-comments', objectiveId] });
      toast({
        title: "Comment Updated",
        description: "Your comment has been updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update comment: " + (error as Error).message,
        variant: "destructive"
      });
    }
  });

  // Delete comment mutation
  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('okr_comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objective-comments', objectiveId] });
      toast({
        title: "Comment Deleted",
        description: "Your comment has been deleted successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete comment: " + (error as Error).message,
        variant: "destructive"
      });
    }
  });

  return {
    comments,
    isLoading,
    error,
    createComment: createComment.mutate,
    updateComment: updateComment.mutate,
    deleteComment: deleteComment.mutate,
    isExpanded,
    toggleCommentExpansion,
    refetch
  };
};
