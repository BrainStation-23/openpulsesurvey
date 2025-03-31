
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Send, X, AtSign, User } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger,
  PopoverAnchor
} from "@/components/ui/popover";
import { useMentionableUsers } from '@/hooks/okr/useMentionableUsers';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  isReply?: boolean;
  autoFocus?: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  onCancel,
  placeholder = "Add a comment...",
  isReply = false,
  autoFocus = false
}) => {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(autoFocus);
  const { user } = useCurrentUser();
  const [showMentionSelector, setShowMentionSelector] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Get users that can be mentioned
  const { users, isLoading: isLoadingUsers } = useMentionableUsers(mentionQuery);
  
  const userInitials = user?.email ? 
    user.email.substring(0, 2).toUpperCase() : 
    'U';
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() === '') return;
    
    onSubmit(content);
    setContent('');
    if (!isReply) setIsFocused(false);
  };

  const handleCancel = () => {
    setContent('');
    if (onCancel) onCancel();
    if (!isReply) setIsFocused(false);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    const curPos = e.target.selectionStart;
    setCursorPosition(curPos);
    
    // Check if we're typing a mention (@)
    const contentBeforeCursor = newContent.substring(0, curPos);
    const lastAtPosition = contentBeforeCursor.lastIndexOf('@');
    
    if (lastAtPosition !== -1 && 
        (lastAtPosition === 0 || newContent[lastAtPosition - 1] === ' ' || newContent[lastAtPosition - 1] === '\n')) {
      const query = contentBeforeCursor.substring(lastAtPosition + 1);
      setMentionQuery(query);
      setShowMentionSelector(true);
    } else {
      setShowMentionSelector(false);
    }
  };
  
  const insertMention = (username: string) => {
    const contentBeforeCursor = content.substring(0, cursorPosition);
    const contentAfterCursor = content.substring(cursorPosition);
    
    const lastAtPosition = contentBeforeCursor.lastIndexOf('@');
    const newContent = 
      contentBeforeCursor.substring(0, lastAtPosition) +
      `@${username} ` +
      contentAfterCursor;
    
    setContent(newContent);
    setShowMentionSelector(false);
    
    // Focus back on textarea and place cursor after the inserted mention
    if (textareaRef.current) {
      textareaRef.current.focus();
      const newPosition = lastAtPosition + username.length + 2; // +2 for @ and space
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = newPosition;
          textareaRef.current.selectionEnd = newPosition;
        }
      }, 0);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Close mention selector on escape
    if (e.key === 'Escape' && showMentionSelector) {
      setShowMentionSelector(false);
      e.preventDefault();
    }
  };

  return (
    <div className={`${isReply ? 'ml-10 mt-2 mb-2' : 'my-4'}`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          {user?.user_metadata?.avatar_url ? (
            <AvatarImage src={user.user_metadata.avatar_url} alt={user.email || ''} />
          ) : (
            <AvatarFallback>{userInitials}</AvatarFallback>
          )}
        </Avatar>
        
        <form onSubmit={handleSubmit} className="flex-1 relative">
          <Popover open={showMentionSelector} onOpenChange={setShowMentionSelector}>
            <Textarea
              ref={textareaRef}
              placeholder={placeholder}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              rows={isFocused ? 3 : 1}
              className={`resize-none transition-all ${isReply ? 'text-sm' : ''}`}
              autoFocus={autoFocus}
            />
            <PopoverAnchor />
            {showMentionSelector && (
              <PopoverContent 
                className="w-64 p-0" 
                align="start"
                side="bottom"
              >
                <div className="py-2 max-h-60 overflow-y-auto">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    {isLoadingUsers ? 'Loading users...' : 'Mention a user'}
                  </div>
                  {users && users.length > 0 ? (
                    <div>
                      {users.map(user => (
                        <Button
                          key={user.id}
                          variant="ghost"
                          className="w-full justify-start text-left px-2 py-1 h-auto"
                          onClick={() => insertMention(user.username)}
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              {user.avatar ? (
                                <AvatarImage src={user.avatar} />
                              ) : (
                                <AvatarFallback className="text-[10px]">
                                  {user.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <span className="text-sm">{user.fullName || user.username}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2 text-sm text-center text-muted-foreground">
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                          Loading...
                        </div>
                      ) : (
                        'No users found'
                      )}
                    </div>
                  )}
                </div>
              </PopoverContent>
            )}
          </Popover>
          
          {content && (
            <div className="absolute right-2 bottom-2 text-xs text-muted-foreground">
              <Button 
                type="button" 
                size="sm" 
                variant="ghost"
                onClick={() => setShowMentionSelector(true)}
                className="h-6 w-6 p-0"
                title="Mention a user"
              >
                <AtSign className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {isFocused && (
            <div className="flex justify-end mt-2 space-x-2">
              <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm" 
                disabled={content.trim() === ''}
              >
                <Send className="h-4 w-4 mr-1" /> {isReply ? 'Reply' : 'Comment'}
              </Button>
            </div>
          )}
          
          {isFocused && (
            <div className="mt-1 text-xs text-muted-foreground">
              <span>Use @ to mention users. Markdown formatting supported.</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
