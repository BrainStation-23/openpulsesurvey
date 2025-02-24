
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AchievementCard } from "./components/AchievementCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Types for our achievements data
interface Achievement {
  id: string;
  name: string;
  description: string;
  achievement_type: 'survey_completion' | 'response_rate' | 'streak' | 'campaign_completion';
  points: number;
  icon: string;
  icon_color: string;
  condition_value: {
    required_count?: number;
    required_rate?: number;
    required_days?: number;
  };
  isUnlocked: boolean;
  progress?: {
    current_value: {
      type: string;
      value: number;
    };
  };
  unlocked_at?: string;
}

export default function UserAchievementsPage() {
  const navigate = useNavigate();

  const { data: achievements, isLoading } = useQuery({
    queryKey: ['user-achievements'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Get all achievements and user's unlocked achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('status', 'active');

      if (achievementsError) throw achievementsError;

      // Get user's unlocked achievements
      const { data: userAchievements, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);

      if (userAchievementsError) throw userAchievementsError;

      // Get achievement progress
      const { data: achievementProgress, error: progressError } = await supabase
        .from('achievement_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Combine the data
      return allAchievements.map(achievement => {
        const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
        const progress = achievementProgress.find(ap => ap.achievement_id === achievement.id);

        return {
          ...achievement,
          isUnlocked: !!userAchievement,
          unlocked_at: userAchievement?.unlocked_at,
          progress: progress ? {
            current_value: progress.current_value
          } : undefined
        };
      });
    }
  });

  const getUnlockCriteria = (achievement: Achievement): string => {
    const { condition_value, achievement_type } = achievement;
    switch (achievement_type) {
      case 'survey_completion':
        return `Complete ${condition_value.required_count} surveys`;
      case 'response_rate':
        return `Maintain a ${condition_value.required_rate}% response rate`;
      case 'streak':
        return `Maintain a streak of ${condition_value.required_days} days`;
      case 'campaign_completion':
        return `Complete ${condition_value.required_count} campaigns`;
      default:
        return 'Complete the required criteria';
    }
  };

  const getProgress = (achievement: Achievement): string | undefined => {
    if (!achievement.progress) return undefined;

    const { condition_value, achievement_type } = achievement;
    const currentValue = achievement.progress.current_value.value;

    switch (achievement_type) {
      case 'survey_completion':
        return `${currentValue}/${condition_value.required_count} surveys`;
      case 'response_rate':
        return `${currentValue.toFixed(1)}%`;
      case 'streak':
        return `${currentValue} days`;
      case 'campaign_completion':
        return `${currentValue}/${condition_value.required_count} campaigns`;
      default:
        return undefined;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading achievements...</div>;
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">My Achievements</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements?.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            name={achievement.name}
            description={achievement.description}
            isUnlocked={achievement.isUnlocked}
            unlockCriteria={getUnlockCriteria(achievement)}
            points={achievement.points}
            iconColor={achievement.icon_color}
            progress={getProgress(achievement)}
            unlockedAt={achievement.unlocked_at}
          />
        ))}
      </div>
    </div>
  );
}
