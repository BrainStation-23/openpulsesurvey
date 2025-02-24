
import { Calendar } from "lucide-react";
import { format, isValid } from "date-fns";

interface CampaignDatesProps {
  createdAt: string;
  startsAt: string;
  endsAt: string;
}

export function CampaignDates({ createdAt, startsAt, endsAt }: CampaignDatesProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy HH:mm') : 'Invalid date';
  };

  return (
    <>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        {formatDate(createdAt)}
      </div>
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>Starts: {formatDate(startsAt)}</span>
        <span>Ends: {formatDate(endsAt)}</span>
      </div>
    </>
  );
}
