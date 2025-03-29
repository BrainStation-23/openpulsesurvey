
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type JsonViewerProps = {
  data: any;
  title?: string;
  className?: string;
  initialExpanded?: boolean;
};

export function JsonDataView({ data, title, className, initialExpanded = false }: JsonViewerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (!data) return null;
  
  // For empty objects
  if (typeof data === 'object' && Object.keys(data).length === 0) {
    return (
      <Card className={cn("bg-muted/50", className)}>
        {title && <div className="px-4 py-2 text-sm font-medium border-b">{title}</div>}
        <CardContent className="p-4 text-sm italic text-muted-foreground">
          Empty data
        </CardContent>
      </Card>
    );
  }

  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">null</span>;
    }

    if (typeof value === "boolean") {
      return <span className="text-blue-500">{value ? "true" : "false"}</span>;
    }

    if (typeof value === "number") {
      return <span className="text-orange-500">{value}</span>;
    }

    if (typeof value === "string") {
      return <span className="text-green-500">"{value}"</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-muted-foreground italic">[]</span>;
      }
      return renderObject(value);
    }

    if (typeof value === "object") {
      return renderObject(value);
    }

    return String(value);
  };

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderObject = (obj: any, prefix = ""): React.ReactNode => {
    if (!obj) return null;
    
    return Object.entries(obj).map(([key, value], index) => {
      const fullPath = `${prefix}${key}`;
      const isExpandable = typeof value === "object" && value !== null;
      const isExpanded = expanded[fullPath] ?? initialExpanded;

      return (
        <div key={fullPath} className="ml-4">
          <div className="flex items-center gap-1">
            {isExpandable ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={() => toggleExpand(fullPath)}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            ) : (
              <span className="w-5" />
            )}
            <span className="font-medium">{key}: </span>
            {!isExpandable || !isExpanded ? renderValue(value) : null}
          </div>
          
          {isExpandable && isExpanded && (
            <div className="ml-2 border-l-2 pl-2 border-muted">
              {renderObject(value, `${fullPath}.`)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Card className={cn("bg-muted/50", className)}>
      {title && <div className="px-4 py-2 text-sm font-medium border-b">{title}</div>}
      <CardContent className="p-4 overflow-auto max-h-[300px]">
        <div className="font-mono text-sm">{renderObject(data)}</div>
      </CardContent>
    </Card>
  );
}
