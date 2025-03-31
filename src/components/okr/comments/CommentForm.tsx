
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Send, X } from 'lucide-react';

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
        
        <form onSubmit={handleSubmit} className="flex-1">
          <Textarea
            placeholder={placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            rows={isFocused ? 3 : 1}
            className={`resize-none transition-all ${isReply ? 'text-sm' : ''}`}
            autoFocus={autoFocus}
          />
          
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
        </form>
      </div>
    </div>
  );
};
