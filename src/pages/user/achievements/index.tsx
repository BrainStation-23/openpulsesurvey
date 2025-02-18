
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ACHIEVEMENT_TYPE_CONFIG, AchievementType } from "@/pages/admin/achievements/types";

export default function UserAchievementsPage() {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['user-achievements'],
    queryFn: async () => {
      const { data: userAchievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements (*)
        `)
        .order('unlocked_at', { ascending: false });

      if (achievementsError) throw achievementsError;
      return userAchievements;
    },
  });

  const { data: availableAchievements } = useQuery({
    queryKey: ['available-achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Your Achievements</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {achievements?.map((userAchievement) => (
            <Card key={userAchievement.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {userAchievement.achievement.name}
                </CardTitle>
                <Trophy className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {userAchievement.achievement.description}
                </p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="secondary">
                    {userAchievement.achievement.points} pts
                  </Badge>
                  <Badge variant="outline">
                    {ACHIEVEMENT_TYPE_CONFIG[userAchievement.achievement.achievement_type as AchievementType].label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Available Achievements</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableAchievements?.filter(achievement => 
            !achievements?.some(ua => ua.achievement_id === achievement.id)
          ).map((achievement) => (
            <Card key={achievement.id} className="opacity-70">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {achievement.name}
                </CardTitle>
                <Trophy className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="secondary">
                    {achievement.points} pts
                  </Badge>
                  <Badge variant="outline">
                    {ACHIEVEMENT_TYPE_CONFIG[achievement.achievement_type as AchievementType].label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
