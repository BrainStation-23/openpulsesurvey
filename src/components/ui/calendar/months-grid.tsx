
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MonthsGridProps {
  selected: Date | undefined;
  currentYear: number;
  onMonthSelect: (monthIndex: number) => void;
  onYearViewToggle: () => void;
}

export function MonthsGrid({ selected, currentYear, onMonthSelect, onYearViewToggle }: MonthsGridProps) {
  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onYearViewToggle}
        >
          <span className="font-medium">{currentYear}</span>
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {months.map((month, index) => (
          <Button
            key={month}
            variant="ghost"
            className={cn(
              "h-9 w-full rounded-md p-0",
              selected instanceof Date &&
              selected.getMonth() === index &&
              "bg-primary text-primary-foreground"
            )}
            onClick={() => onMonthSelect(index)}
          >
            {month.slice(0, 3)}
          </Button>
        ))}
      </div>
    </div>
  );
}
