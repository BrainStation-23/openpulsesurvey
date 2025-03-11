
import * as React from "react";
import { CaptionProps } from "react-day-picker";

interface CalendarHeaderProps extends Partial<CaptionProps> {
  displayMonth: Date;
  currentYear: number;
  onHeaderClick: () => void;
}

export function CalendarHeader({ displayMonth, currentYear, onHeaderClick }: CalendarHeaderProps) {
  return (
    <div className="flex justify-center items-center gap-1">
      <button
        className="text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md px-2 py-1"
        onClick={onHeaderClick}
      >
        {displayMonth.toLocaleString('default', { month: 'long' })} {currentYear}
      </button>
    </div>
  );
}
