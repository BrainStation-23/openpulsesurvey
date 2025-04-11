
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { TemplateVariable } from "@/types/email-templates";
import { Variable } from "lucide-react";

interface VariableMenuProps {
  variables: TemplateVariable[];
  onInsert: (variable: TemplateVariable) => void;
}

export function VariableMenu({ variables, onInsert }: VariableMenuProps) {
  // Group variables by category
  const categorizedVariables = variables.reduce(
    (acc, variable) => {
      if (!acc[variable.category]) {
        acc[variable.category] = [];
      }
      acc[variable.category].push(variable);
      return acc;
    },
    {} as Record<string, TemplateVariable[]>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Variable className="mr-2 h-4 w-4" />
          Insert Variable
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Template Variables</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(categorizedVariables).map(([category, vars]) => (
          <React.Fragment key={category}>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {vars.map((variable) => (
                <DropdownMenuItem
                  key={variable.id}
                  onClick={() => onInsert(variable)}
                >
                  <span className="font-mono text-xs mr-2">
                    {`{{${variable.name}}}`}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {variable.description}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
