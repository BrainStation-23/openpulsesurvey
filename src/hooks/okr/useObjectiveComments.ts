
import { useState, useCallback, useEffect, useMemo } from 'react';
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

interface FetchCommentsOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

const DEFAULT_PAGE_SIZE = 20;

export const useObjectiveComments = (objectiveId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const toggleCommentExpansion = useCallback((commentId: string) => {
    setIsExpanded(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  }, []);

  // Fetch comments with pagination
  const fetchComments = useCallback(async ({ page = 1, limit = DEFAULT_PAGE_SIZE }: FetchCommentsOptions = {}) => {
    if (!objectiveId) return { comments: [], hasMore: false };
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Fetch all comments for this objective with pagination
    const { data: comments, error, count } = await supabase
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
      `, { count: 'exact' })
      .eq('objective_id', objectiveId)
      .is('parent_comment_id', null) // Only fetch root comments (not replies)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching comments:', error);
      return { comments: [], hasMore: false };
    }
    
    // Determine if there are more comments to load
    const hasMore = count ? offset + limit < count : false;
    
    // Transform to our Comment interface
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
    
    // For each comment, fetch its replies
    for (const comment of formattedComments) {
      const { data: replies, error: repliesError } = await supabase
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
        .eq('parent_comment_id', comment.id)
        .order('created_at', { ascending: true });
      
      if (repliesError) {
        console.error('Error fetching replies:', repliesError);
        continue;
      }
      
      comment.replies = replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.created_at,
        updatedAt: reply.updated_at,
        createdBy: reply.created_by,
        objectiveId: reply.objective_id,
        keyResultId: reply.key_result_id,
        parentCommentId: reply.parent_comment_id,
        creatorName: reply.profiles ? 
          `${reply.profiles.first_name || ''} ${reply.profiles.last_name || ''}`.trim() : 
          'Unknown User',
        creatorProfileImage: reply.profiles?.profile_image_url
      }));
    }
    
    return { comments: formattedComments, hasMore };
  }, [objectiveId]);

  // Query for comments with pagination
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['objective-comments', objectiveId, page],
    queryFn: () => fetchComments({ page }),
    enabled: !!objectiveId,
    staleTime: 1000 * 60 // 1 minute
  });

  // Load more comments
  const loadMoreComments = useCallback(() => {
    if (hasMore && !isLoading) {
      setPage(prevPage => prevPage + 1);
    }
  }, [hasMore, isLoading]);

  // Update hasMore state when data changes
  useEffect(() => {
    if (data) {
      setHasMore(data.hasMore);
    }
  }, [data]);

  // Combine comments from all pages
  const allComments = useMemo(() => {
    const queries = queryClient.getQueriesData({
      queryKey: ['objective-comments', objectiveId]
    });
    
    let combinedComments: Comment[] = [];
    
    queries.forEach(([, pageData]) => {
      const typedData = pageData as { comments: Comment[], hasMore: boolean } | undefined;
      if (typedData?.comments) {
        combinedComments = [...combinedComments, ...typedData.comments];
      }
    });
    
    // Remove duplicates
    const uniqueComments = Array.from(
      new Map(combinedComments.map(comment => [comment.id, comment])).values()
    );
    
    // Sort by created date (newest first)
    return uniqueComments.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [queryClient, objectiveId, page]);

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
    onSuccess: (_, variables) => {
      // Reset to first page to show the new comment
      if (!variables.parentCommentId) {
        setPage(1);
      }
      
      // Only invalidate the specific objectiveId
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
    comments: data?.comments || [],
    isLoading,
    error,
    createComment: createComment.mutate,
    updateComment: updateComment.mutate,
    deleteComment: deleteComment.mutate,
    isExpanded,
    toggleCommentExpansion,
    loadMoreComments,
    hasMoreComments: hasMore,
    refetch
  };
};
