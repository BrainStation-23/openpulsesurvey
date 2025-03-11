
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, CaptionProps } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [mode, setMode] = React.useState<"days" | "months" | "years">("days");
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());

  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];

  const generateYearGrid = () => {
    const startYear = Math.floor(currentYear / 12) * 12;
    return Array.from({ length: 12 }, (_, i) => startYear + i);
  };

  const handleYearClick = (year: number) => {
    if (props.selected instanceof Date) {
      const newDate = new Date(props.selected);
      newDate.setFullYear(year);
      props.onDayClick?.(newDate);
    }
    setCurrentYear(year);
    setMode("months");
  };

  const handleMonthClick = (monthIndex: number) => {
    if (props.selected instanceof Date) {
      const newDate = new Date(props.selected);
      newDate.setMonth(monthIndex);
      props.onDayClick?.(newDate);
    }
    setMode("days");
  };

  const handleHeaderClick = () => {
    setMode(mode === "days" ? "months" : "years");
  };

  const handleTodayClick = () => {
    const today = new Date();
    props.onDayClick?.(today);
  };

  if (mode === "years") {
    return (
      <div className={cn("p-3", className)}>
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentYear(currentYear - 12)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">
            {generateYearGrid()[0]} - {generateYearGrid()[11]}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentYear(currentYear + 12)}
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
                props.selected instanceof Date && 
                year === props.selected.getFullYear() && 
                "bg-primary text-primary-foreground"
              )}
              onClick={() => handleYearClick(year)}
            >
              {year}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (mode === "months") {
    return (
      <div className={cn("p-3", className)}>
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMode("years")}
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
                props.selected instanceof Date && 
                props.selected.getMonth() === index && 
                "bg-primary text-primary-foreground"
              )}
              onClick={() => handleMonthClick(index)}
            >
              {month.slice(0, 3)}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center items-center pt-1 relative",
        caption_label: "text-sm font-medium cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md px-2 py-1",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 bg-transparent p-0 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
        Caption: ({ displayMonth, ...props }) => (
          <div className="flex justify-center items-center gap-1">
            <button
              className="text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md px-2 py-1"
              onClick={handleHeaderClick}
            >
              {displayMonth.toLocaleString('default', { month: 'long' })} {currentYear}
            </button>
          </div>
        ),
      }}
      footer={
        <div className="mt-3 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleTodayClick}
          >
            Today
          </Button>
        </div>
      }
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
