
import { useState } from "react";
import type { Scenario } from "../../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ScenarioDisplayProps {
  scenario: Scenario;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ScenarioDisplay({ scenario, isExpanded, onToggle }: ScenarioDisplayProps) {
  return (
    <Card className="transition-all duration-300">
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <CardTitle>{scenario.name}</CardTitle>
          <Button variant="ghost" size="icon">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {scenario.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent 
          className="animate-accordion-down"
        >
          <div 
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: scenario.story }}
          />
        </CardContent>
      )}
    </Card>
  );
}
