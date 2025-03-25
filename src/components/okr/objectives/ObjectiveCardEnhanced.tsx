
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, ListChecks, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { ObjectiveStatusBadge } from "./ObjectiveStatusBadge";
import { ObjectiveWithOwner } from '@/types/okr-extended';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ObjectiveCardEnhancedProps {
  objective: ObjectiveWithOwner;
  childCount?: number;
  keyResultsCount?: number;
  isAdmin?: boolean;
}

export const ObjectiveCardEnhanced: React.FC<ObjectiveCardEnhancedProps> = ({
  objective,
  childCount = 0,
  keyResultsCount = objective.keyResultsCount || 0,
  isAdmin = false,
}) => {
  // Generate initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="truncate text-lg font-semibold">{objective.title}</CardTitle>
          <ObjectiveStatusBadge status={objective.status} />
        </div>
      </CardHeader>
      <CardContent className="py-2 flex-1">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {objective.description || "No description provided"}
          </p>
          
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-xs font-medium">Progress</span>
              <span className="text-xs font-medium">{objective.progress}%</span>
            </div>
            <Progress value={objective.progress} className="h-2" />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <ListChecks className="h-3 w-3" />
              <span>{keyResultsCount} Key Results</span>
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{childCount} Child Objectives</span>
            </Badge>
            
            <Badge variant={objective.visibility === 'private' ? 'default' : 'outline'} className="capitalize">
              {objective.visibility}
            </Badge>
          </div>

          {objective.owner && (
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={objective.owner.avatarUrl || undefined} alt={objective.owner.fullName} />
                <AvatarFallback>{getInitials(objective.owner.fullName)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">
                {objective.owner.fullName}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          variant="outline" 
          className="w-full" 
          asChild
        >
          <Link to={`/user/okrs/objectives/${objective.id}`}>
            View Details
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
