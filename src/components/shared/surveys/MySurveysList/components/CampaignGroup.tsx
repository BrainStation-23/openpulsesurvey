
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { UserSurvey } from "@/pages/admin/surveys/types/user-surveys";
import SurveyCard from "../SurveyCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface CampaignGroupProps {
  campaignId: string;
  name: string;
  description?: string | null;
  instances: UserSurvey[];
  onSelectSurvey: (survey: UserSurvey) => void;
}

export default function CampaignGroup({
  name,
  description,
  instances,
  onSelectSurvey
}: CampaignGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const completedCount = instances.filter(i => i.status === 'submitted').length;
  const totalCount = instances.length;
  const completionRate = Math.round((completedCount / totalCount) * 100);

  // Find the earliest due date among non-completed instances
  const nextDueDate = instances
    .filter(i => i.status !== 'submitted' && i.instance.ends_at)
    .map(i => new Date(i.instance.ends_at!))
    .sort((a, b) => a.getTime() - b.getTime())[0];

  const getDueDateColor = (date: Date) => {
    const now = new Date();
    const daysUntilDue = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue < 0) return "text-destructive";
    if (daysUntilDue <= 3) return "text-yellow-500";
    return "text-muted-foreground";
  };

  return (
    <div className="border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <h3 className="font-medium">{name}</h3>
          </div>
          <div className="flex items-center gap-4">
            {nextDueDate && (
              <span className={`text-sm ${getDueDateColor(nextDueDate)}`}>
                Next due: {nextDueDate.toLocaleDateString()}
              </span>
            )}
            <span className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} completed
            </span>
          </div>
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground ml-6 mb-2">{description}</p>
        )}
        
        <div className="ml-6">
          <Progress 
            value={completionRate} 
            className="h-2"
            indicatorClassName={completionRate === 100 ? "bg-green-500" : undefined}
          />
        </div>
      </div>
      
      {isExpanded && (
        <div className="border-t">
          <div className="p-4 space-y-2">
            {instances.map((survey) => (
              <SurveyCard
                key={survey.instance.unique_key || `${survey.id}_${survey.instance.period_number}`}
                survey={survey}
                onSelect={() => onSelectSurvey(survey)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
