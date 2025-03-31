
import React, { useState } from 'react';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { Comment } from '@/hooks/okr/useObjectiveComments';
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

interface CommentListProps {
  comments: Comment[];
  onCreateComment: (content: string, parentId?: string) => void;
  onUpdateComment: (id: string, content: string) => void;
  onDeleteComment: (id: string) => void;
  isExpanded: Record<string, boolean>;
  onToggleExpand: (commentId: string) => void;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
  isExpanded,
  onToggleExpand
}) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleReply = (parentId: string) => {
    setReplyingTo(parentId);
    // Auto expand replies when starting to reply
    if (!isExpanded[parentId] && parentId) {
      onToggleExpand(parentId);
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleSubmitReply = (content: string) => {
    if (replyingTo) {
      onCreateComment(content, replyingTo);
      setReplyingTo(null);
    }
  };

  return (
    <div>
      {comments.map((comment) => (
        <div key={comment.id}>
          <CommentItem 
            comment={comment} 
            onReply={() => handleReply(comment.id)}
            onEdit={onUpdateComment}
            onDelete={onDeleteComment}
            expanded={!!isExpanded[comment.id]}
            onToggleExpand={() => onToggleExpand(comment.id)}
          />
          
          {/* Replies section */}
          {comment.replies && comment.replies.length > 0 && (
            <Collapsible open={!!isExpanded[comment.id]}>
              <CollapsibleContent>
                <div className="ml-10 mt-2 space-y-2 border-l-2 border-muted pl-3">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id} 
                      comment={reply} 
                      onReply={() => handleReply(comment.id)}
                      onEdit={onUpdateComment}
                      onDelete={onDeleteComment}
                      expanded={false}
                      onToggleExpand={() => {}}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
          
          {/* Reply form */}
          {replyingTo === comment.id && (
            <CommentForm
              onSubmit={handleSubmitReply}
              onCancel={handleCancelReply}
              placeholder="Write a reply..."
              isReply
              autoFocus
            />
          )}
        </div>
      ))}
    </div>
  );
};
