
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Survey {
  id: string;
  survey: {
    id: string;
    name: string;
    description: string | null;
  };
  campaign: {
    id: string;
    name: string;
    starts_at: string;
    ends_at: string | null;
  };
}

interface SurveyCardProps {
  survey: Survey;
}

export default function SurveyCard({ survey }: SurveyCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{survey.survey.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {survey.survey.description}
          </p>
          <div className="text-sm">
            <p>Campaign: {survey.campaign.name}</p>
            <p>Starts: {format(new Date(survey.campaign.starts_at), 'PPP')}</p>
            {survey.campaign.ends_at && (
              <p>Ends: {format(new Date(survey.campaign.ends_at), 'PPP')}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
