
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  value?: DateRange;
  onChange?: (date: DateRange | undefined) => void;
  className?: string;
}

export function DatePickerWithRange({
  value,
  onChange,
  className,
}: DatePickerWithRangeProps) {
  const formatDateRange = () => {
    try {
      if (!value) return <span>Pick a date range</span>;
      
      if (value.from) {
        if (value.to) {
          return (
            <>
              {format(value.from, "LLL dd, y")} -{" "}
              {format(value.to, "LLL dd, y")}
            </>
          );
        }
        return format(value.from, "LLL dd, y");
      }
      
      return <span>Pick a date range</span>;
    } catch (error) {
      console.error("Error formatting date range:", error);
      return <span>Pick a date range</span>;
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
