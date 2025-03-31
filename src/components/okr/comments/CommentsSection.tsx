
import React, { useEffect, useState } from 'react';
import { useObjectiveComments } from '@/hooks/okr/useObjectiveComments';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { Spinner } from '@/components/ui/spinner';
import { MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInView } from 'react-intersection-observer';

interface CommentsSectionProps {
  objectiveId: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ objectiveId }) => {
  const { 
    comments, 
    isLoading, 
    error,
    createComment, 
    updateComment, 
    deleteComment,
    isExpanded,
    toggleCommentExpansion,
    loadMoreComments,
    hasMoreComments,
    refetch
  } = useObjectiveComments(objectiveId);

  const [isSendingComment, setIsSendingComment] = useState(false);
  const { ref: loadMoreRef, inView } = useInView();
  
  // Load more comments when scrolled to bottom
  useEffect(() => {
    if (inView && hasMoreComments && !isLoading) {
      loadMoreComments();
    }
  }, [inView, hasMoreComments, isLoading, loadMoreComments]);

  const handleCreateComment = async (content: string, parentId?: string) => {
    setIsSendingComment(true);
    try {
      await createComment({
        content,
        objectiveId,
        parentCommentId: parentId
      });
    } finally {
      setIsSendingComment(false);
    }
  };

  const handleUpdateComment = (id: string, content: string) => {
    updateComment({
      id,
      content
    });
  };

  if (error) {
    return (
      <div className="p-6 bg-muted/20 rounded-lg text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-destructive mb-2" />
        <h3 className="text-lg font-medium">Failed to load comments</h3>
        <p className="text-sm text-muted-foreground mb-4">
          There was an error loading the comments. Please try again.
        </p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-medium">Comments</h3>
      </div>

      <CommentForm 
        onSubmit={(content) => handleCreateComment(content)}
        placeholder="Add a comment..."
        isReply={false}
      />
      
      {isLoading && !comments?.length ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : comments && comments.length > 0 ? (
        <>
          <CommentList 
            comments={comments}
            onCreateComment={handleCreateComment}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={deleteComment}
            isExpanded={isExpanded}
            onToggleExpand={toggleCommentExpansion}
          />
          
          {/* Load more indicator */}
          {hasMoreComments && (
            <div 
              ref={loadMoreRef} 
              className="flex justify-center py-4"
            >
              <Spinner className="h-5 w-5" />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}
      
      {/* Sending indicator */}
      {isSendingComment && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg flex items-center space-x-2 z-50">
          <Spinner className="h-4 w-4" />
          <span className="text-sm">Sending comment...</span>
        </div>
      )}
    </div>
  );
};
