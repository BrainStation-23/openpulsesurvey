
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface YearsGridProps {
  currentYear: number;
  selected: Date | undefined;
  onYearSelect: (year: number) => void;
  onDecadeChange: (increment: number) => void;
}

export function YearsGrid({ currentYear, selected, onYearSelect, onDecadeChange }: YearsGridProps) {
  const generateYearGrid = () => {
    const startYear = Math.floor(currentYear / 12) * 12;
    return Array.from({ length: 12 }, (_, i) => startYear + i);
  };

  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDecadeChange(-12)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium">
          {generateYearGrid()[0]} - {generateYearGrid()[11]}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDecadeChange(12)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {generateYearGrid().map((year) => (
          <Button
            key={year}
            variant="ghost"
            className={cn(
              "h-9 w-full rounded-md p-0",
              selected instanceof Date &&
              year === selected.getFullYear() &&
              "bg-primary text-primary-foreground"
            )}
            onClick={() => onYearSelect(year)}
          >
            {year}
          </Button>
        ))}
      </div>
    </div>
  );
}
