
import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MultiSelectDropdown } from "./MultiSelectDropdown";

interface AccessLevelGroupProps {
  title: string;
  icon: React.ReactNode;
  selections: Array<{
    label: string;
    options: Array<{ id: string; name: string }>;
    value: string[];
    onChange: (value: string[]) => void;
  }>;
}

export function AccessLevelGroup({ title, icon, selections }: AccessLevelGroupProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const totalSelected = selections.reduce((sum, sel) => sum + (sel.value?.length || 0), 0);

  return (
    <div className="border rounded-lg p-4 mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="font-medium">{title}</h3>
            </div>
          </div>
          {totalSelected > 0 && (
            <Badge variant="secondary">
              {totalSelected} selected
            </Badge>
          )}
        </div>

        <CollapsibleContent>
          <div className="mt-4 space-y-4">
            {selections.map((selection, index) => (
              <MultiSelectDropdown
                key={index}
                options={selection.options}
                value={selection.value}
                onChange={selection.onChange}
                placeholder={`Select ${selection.label}`}
                label={selection.label}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
