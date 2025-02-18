
import type { Scenario } from "../../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScenarioDisplayProps {
  scenario: Scenario;
}

export function ScenarioDisplay({ scenario }: ScenarioDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{scenario.name}</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {scenario.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: scenario.story }}
        />
      </CardContent>
    </Card>
  );
}
