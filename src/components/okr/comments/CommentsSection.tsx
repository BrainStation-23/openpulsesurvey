
import React from 'react';
import { useObjectiveComments } from '@/hooks/okr/useObjectiveComments';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { Spinner } from '@/components/ui/spinner';
import { MessageSquare } from 'lucide-react';

interface CommentsSectionProps {
  objectiveId: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ objectiveId }) => {
  const { 
    comments, 
    isLoading, 
    createComment, 
    updateComment, 
    deleteComment,
    isExpanded,
    toggleCommentExpansion
  } = useObjectiveComments(objectiveId);

  const handleCreateComment = (content: string, parentId?: string) => {
    createComment({
      content,
      objectiveId,
      parentCommentId: parentId
    });
  };

  const handleUpdateComment = (id: string, content: string) => {
    updateComment({
      id,
      content
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-medium">Comments</h3>
      </div>

      <CommentForm 
        onSubmit={(content) => handleCreateComment(content)}
        placeholder="Add a comment..."
      />
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : comments && comments.length > 0 ? (
        <CommentList 
          comments={comments}
          onCreateComment={handleCreateComment}
          onUpdateComment={handleUpdateComment}
          onDeleteComment={deleteComment}
          isExpanded={isExpanded}
          onToggleExpand={toggleCommentExpansion}
        />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
};
