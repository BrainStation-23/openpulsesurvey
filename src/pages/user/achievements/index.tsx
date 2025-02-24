
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AchievementCard } from "./components/AchievementCard";

// This would typically come from an API or database
const achievements = [
  {
    id: "1",
    name: "First Response",
    description: "Complete your first survey",
    unlockCriteria: "Submit your first survey response to unlock this achievement",
    points: 10,
    isUnlocked: true
  },
  {
    id: "2",
    name: "Quick Responder",
    description: "Complete a survey within 24 hours of assignment",
    unlockCriteria: "Submit any survey within 24 hours of it being assigned to you",
    points: 20,
    isUnlocked: false
  },
  {
    id: "3",
    name: "Feedback Champion",
    description: "Complete 10 surveys",
    unlockCriteria: "Successfully submit 10 different surveys",
    points: 50,
    isUnlocked: false
  },
  {
    id: "4",
    name: "Perfect Streak",
    description: "Complete 5 surveys in a row before their due dates",
    unlockCriteria: "Submit 5 consecutive surveys before their respective deadlines",
    points: 100,
    isUnlocked: false
  }
];

export default function UserAchievementsPage() {
  const navigate = useNavigate();
  
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
        {achievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            name={achievement.name}
            description={achievement.description}
            isUnlocked={achievement.isUnlocked}
            unlockCriteria={achievement.unlockCriteria}
            points={achievement.points}
          />
        ))}
      </div>
    </div>
  );
}
