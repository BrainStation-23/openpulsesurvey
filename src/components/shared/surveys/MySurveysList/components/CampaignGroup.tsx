
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { UserSurvey } from "@/pages/admin/surveys/types/user-surveys";
import SurveyCard from "../SurveyCard";
import { Button } from "@/components/ui/button";

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
  const [isExpanded, setIsExpanded] = useState(true);
  
  const completedCount = instances.filter(i => i.status === 'submitted').length;
  const totalCount = instances.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <Button variant="ghost" size="sm" className="p-0 h-auto">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
        <div className="flex-1">
          <div className="font-medium">{name}</div>
          {description && <div className="text-sm text-muted-foreground">{description}</div>}
        </div>
        <div className="text-sm text-muted-foreground">
          {completedCount} of {totalCount} completed
        </div>
      </div>
      
      {isExpanded && (
        <div className="pl-6 space-y-2">
          {instances.map((survey) => (
            <SurveyCard
              key={survey.instance.unique_key || `${survey.id}_${survey.instance.period_number}`}
              survey={survey}
              onSelect={() => onSelectSurvey(survey)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
