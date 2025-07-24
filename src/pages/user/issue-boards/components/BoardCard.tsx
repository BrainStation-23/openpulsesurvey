
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, MessageSquare, Calendar } from "lucide-react";
import type { UserIssueBoard } from "../types";

interface BoardCardProps {
  board: UserIssueBoard;
}

export function BoardCard({ board }: BoardCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_70%)]" />
      
      {/* Color Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-accent" />
      
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {board.name}
          </h3>
          {board.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {board.description}
            </p>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <span>Issues</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Board</span>
          </div>
        </div>

        {/* Permissions */}
        <div className="flex flex-wrap gap-2">
          {board.permissions.can_create && (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Can Create
            </div>
          )}
          {board.permissions.can_vote && (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Can Vote
            </div>
          )}
          {!board.permissions.can_create && !board.permissions.can_vote && (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              View Only
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/user/issue-boards/${board.id}`)}
            className="w-full justify-between group-hover:bg-primary/10 group-hover:text-primary transition-colors"
          >
            <span className="font-medium">View Board</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
