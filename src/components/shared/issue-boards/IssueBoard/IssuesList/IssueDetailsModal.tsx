
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, User } from "lucide-react";
import type { Issue } from "../../types";

interface IssueDetailsModalProps {
  issue: Issue;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - remove script tags and event handlers
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

export function IssueDetailsModal({ issue, open, onOpenChange }: IssueDetailsModalProps) {
  const sanitizedDescription = issue.description ? sanitizeHtml(issue.description) : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left">{issue.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Issue metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground border-b pb-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Created {new Date(issue.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>ID: {issue.id.slice(0, 8)}</span>
            </div>
          </div>

          {/* Issue description with HTML rendering */}
          <div className="space-y-2">
            <h4 className="font-medium">Description</h4>
            {issue.description ? (
              <div 
                className="prose prose-sm max-w-none dark:prose-invert border rounded-md p-4 bg-muted/20"
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
              />
            ) : (
              <p className="text-muted-foreground text-sm italic">No description provided</p>
            )}
          </div>

          {/* Voting stats */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-medium text-green-600">{issue.vote_count}</span>
                  <span className="text-muted-foreground ml-1">upvotes</span>
                </div>
                {issue.downvote_count > 0 && (
                  <div className="text-sm">
                    <span className="font-medium text-red-600">{issue.downvote_count}</span>
                    <span className="text-muted-foreground ml-1">downvotes</span>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
