
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CalendarDateTimeProps {
  value?: Date;
  onChange?: (date: Date) => void;
}

export function CalendarDateTime({
  value,
  onChange,
}: CalendarDateTimeProps) {
  // Make sure we have a valid time string
  const getInitialTimeString = () => {
    if (!value || !(value instanceof Date) || isNaN(value.getTime())) {
      return "00:00";
    }
    try {
      return format(value, "HH:mm");
    } catch (error) {
      console.error("Error formatting time:", error);
      return "00:00";
    }
  };

  const [time, setTime] = React.useState(getInitialTimeString);

  // Update time when value changes
  React.useEffect(() => {
    if (value && value instanceof Date && !isNaN(value.getTime())) {
      try {
        setTime(format(value, "HH:mm"));
      } catch (error) {
        console.error("Error updating time from value:", error);
      }
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || !onChange) return;

    try {
      const [hours, minutes] = time.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      
      // Validate the date before calling onChange
      if (!isNaN(newDate.getTime())) {
        onChange(newDate);
      } else {
        console.error("Invalid date created in handleDateSelect");
      }
    } catch (error) {
      console.error("Error in handleDateSelect:", error);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);

    if (value && onChange) {
      try {
        const newDate = new Date(value);
        const [hours, minutes] = newTime.split(":").map(Number);
        
        // Validate hour and minute values
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          console.error("Invalid time values:", hours, minutes);
          return;
        }
        
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        
        // Validate the date before calling onChange
        if (!isNaN(newDate.getTime())) {
          onChange(newDate);
        } else {
          console.error("Invalid date created in handleTimeChange");
        }
      } catch (error) {
        console.error("Error in handleTimeChange:", error);
      }
    }
  };

  // Ensure we have a valid date value for display
  const isValidDate = value && value instanceof Date && !isNaN(value.getTime());

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !isValidDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {isValidDate ? format(value, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={isValidDate ? value : undefined}
            onSelect={handleDateSelect}
            defaultMonth={isValidDate ? value : undefined}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      <TimePicker
        value={time}
        onChange={handleTimeChange}
        className="w-full"
      />
    </div>
  );
}
