
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Comment } from '@/hooks/okr/useObjectiveComments';
import { ChevronDown, ChevronUp, Edit, Trash2, Reply, Check, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  onReply, 
  onEdit, 
  onDelete,
  expanded,
  onToggleExpand
}) => {
  const { userId } = useCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const isAuthor = userId === comment.createdBy;
  const hasReplies = comment.replies && comment.replies.length > 0;
  
  const timeAgo = comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : '';
  const editedTimeAgo = comment.updatedAt && comment.createdAt !== comment.updatedAt ? 
    formatDistanceToNow(new Date(comment.updatedAt), { addSuffix: true }) : '';
  
  const userInitials = comment.creatorName ? 
    comment.creatorName.split(' ').map(n => n[0]).join('').toUpperCase() : 
    '?';
  
  const handleEdit = () => {
    if (editedContent.trim() === '') return;
    onEdit(comment.id, editedContent);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditedContent(comment.content);
    setIsEditing(false);
  };

  return (
    <Card className="mb-2 shadow-sm border-muted hover:border-muted-foreground/20 transition-all">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            {comment.creatorProfileImage && (
              <AvatarImage src={comment.creatorProfileImage} alt={comment.creatorName} />
            )}
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium text-sm">{comment.creatorName || 'Unknown User'}</span>
                <span className="text-xs text-muted-foreground ml-2">{timeAgo}</span>
                {editedTimeAgo && (
                  <span className="text-xs text-muted-foreground ml-2">(edited {editedTimeAgo})</span>
                )}
              </div>
              {isAuthor && !isEditing && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this comment? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(comment.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
            
            {isEditing ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={3}
                  className="resize-none"
                  autoFocus
                  placeholder="Use markdown for formatting. *italic* **bold** `code` etc."
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={cancelEdit}
                  >
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleEdit}
                    disabled={editedContent.trim() === ''}
                  >
                    <Check className="h-4 w-4 mr-1" /> Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm mt-1 prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:mb-1">
                <ReactMarkdown>{comment.content}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="py-1 px-5 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onReply(comment.id)}
        >
          <Reply className="h-3 w-3 mr-1" /> Reply
        </Button>
        
        {hasReplies && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleExpand}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" /> 
                Hide {comment.replies?.length} {comment.replies?.length === 1 ? 'reply' : 'replies'}
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" /> 
                Show {comment.replies?.length} {comment.replies?.length === 1 ? 'reply' : 'replies'}
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
