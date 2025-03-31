
import React, { useState } from 'react';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { Comment } from '@/hooks/okr/useObjectiveComments';
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

  // Group comments by creation date for better organization
  const groupedComments = comments.reduce((acc, comment) => {
    const date = new Date(comment.createdAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(comment);
    return acc;
  }, {} as Record<string, Comment[]>);

  // Sort dates newest to oldest
  const sortedDates = Object.keys(groupedComments).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedDates.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {sortedDates.map((date) => (
            <AccordionItem key={date} value={date} className="border-b">
              <AccordionTrigger className="hover:no-underline py-2">
                <span className="text-sm font-medium">{date}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {groupedComments[date].length} {groupedComments[date].length === 1 ? 'comment' : 'comments'}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-1">
                  {groupedComments[date].map((comment) => (
                    <div key={comment.id} className="group">
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
                            <div className="ml-10 mt-1 space-y-2 border-l-2 border-muted pl-3">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="group"> 
                                  <CommentItem
                                    comment={reply} 
                                    onReply={() => handleReply(comment.id)}
                                    onEdit={onUpdateComment}
                                    onDelete={onDeleteComment}
                                    expanded={false}
                                    onToggleExpand={() => {}}
                                  />
                                </div>
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
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
};
