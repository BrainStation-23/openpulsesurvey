
import { Lock, Trophy } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

interface AchievementCardProps {
  name: string;
  description: string;
  isUnlocked: boolean;
  unlockCriteria: string;
  points: number;
}

export function AchievementCard({ name, description, isUnlocked, unlockCriteria, points }: AchievementCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Card className={cn(
          "relative cursor-pointer transition-all hover:shadow-md",
          isUnlocked ? "border-primary" : "opacity-75"
        )}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={cn(
                "text-lg",
                isUnlocked ? "text-primary" : "text-muted-foreground"
              )}>
                {name}
              </CardTitle>
              {isUnlocked ? (
                <Trophy className="h-5 w-5 text-primary" />
              ) : (
                <Lock className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <CardDescription className="mt-2">{description}</CardDescription>
            <div className="mt-2 text-sm font-medium">
              {points} points
            </div>
          </CardHeader>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">How to unlock:</h4>
          <p className="text-sm text-muted-foreground">{unlockCriteria}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
