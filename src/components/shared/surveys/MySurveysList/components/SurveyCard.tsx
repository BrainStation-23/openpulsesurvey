
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
  responses: Array<{
    status: 'assigned' | 'in_progress' | 'submitted' | 'expired';
  }>;
}

interface SurveyCardProps {
  survey: Survey;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'submitted':
      return 'bg-green-500';
    case 'in_progress':
      return 'bg-blue-500';
    case 'expired':
      return 'bg-red-500';
    default:
      return 'bg-yellow-500';
  }
};

export default function SurveyCard({ survey }: SurveyCardProps) {
  const status = survey.responses?.[0]?.status || 'assigned';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{survey.survey.name}</CardTitle>
          <Badge className={getStatusColor(status)}>
            {status.replace('_', ' ')}
          </Badge>
        </div>
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
