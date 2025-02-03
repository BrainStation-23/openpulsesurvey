import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SurveyCardProps {
  id: string;
  name: string;
  description: string | null;
  tags: string[] | null;
  status: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function SurveyCard({
  id,
  name,
  description,
  tags,
  status,
  isSelected,
  onSelect,
}: SurveyCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer p-6 transition-all hover:bg-accent/50",
        isSelected && "border-primary bg-accent/50"
      )}
      onClick={() => onSelect(id)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold leading-none tracking-tight">{name}</h3>
            {isSelected ? (
              <Check className="h-5 w-5 text-primary" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {tags?.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
            <Badge variant={status === "published" ? "secondary" : "outline"}>
              {status}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}