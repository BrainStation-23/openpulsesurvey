
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface InstanceCardProps {
  periodNumber: number;
  startsAt: string;
  endsAt: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function InstanceCard({ periodNumber, startsAt, endsAt, isSelected, onClick }: InstanceCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-colors hover:bg-accent ${isSelected ? 'border-primary' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="p-4">
        <h3 className="font-semibold">Period {periodNumber}</h3>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground">
          {format(new Date(startsAt), "MMM d")} - {format(new Date(endsAt), "MMM d")}
        </p>
      </CardContent>
    </Card>
  );
}
