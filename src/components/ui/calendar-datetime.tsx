
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
  // Set a safe default time format if value is undefined
  const [time, setTime] = React.useState(() => {
    try {
      return value ? format(value, "HH:mm") : "00:00";
    } catch (error) {
      console.error("Error formatting initial time:", error);
      return "00:00";
    }
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || !onChange) return;

    try {
      // Safely parse time parts with fallbacks
      const [hoursStr, minutesStr] = time.split(":");
      const hours = parseInt(hoursStr, 10) || 0;
      const minutes = parseInt(minutesStr, 10) || 0;
      
      // Create a new date to avoid mutating the original
      const newDate = new Date(date);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      
      onChange(newDate);
    } catch (error) {
      console.error("Error handling date selection:", error);
      // If there's an error, at least set the date part correctly
      onChange(date);
    }
  };

  const handleTimeChange = (newTime: string) => {
    try {
      setTime(newTime);

      if (value && onChange) {
        // Parse time parts safely with fallbacks
        const [hoursStr, minutesStr] = newTime.split(":").map(part => part.trim());
        
        // Handle 12-hour format (with AM/PM)
        let hours = 0;
        if (hoursStr.includes("AM") || hoursStr.includes("PM")) {
          const isPM = hoursStr.includes("PM");
          const hourNum = parseInt(hoursStr.replace(/AM|PM/g, ""), 10) || 0;
          hours = isPM && hourNum < 12 ? hourNum + 12 : hourNum;
          if (isPM && hourNum === 12) hours = 12;
          if (!isPM && hourNum === 12) hours = 0;
        } else {
          hours = parseInt(hoursStr, 10) || 0;
        }
        
        const minutes = parseInt(minutesStr, 10) || 0;
        
        // Create a new date to avoid mutating the original
        const newDate = new Date(value);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        
        onChange(newDate);
      }
    } catch (error) {
      console.error("Error handling time change:", error);
    }
  };

  // Format the display date safely
  const getFormattedDate = () => {
    try {
      return value ? format(value, "PPP") : null;
    } catch (error) {
      console.error("Error formatting date for display:", error);
      return null;
    }
  };

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getFormattedDate() ? getFormattedDate() : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            defaultMonth={value || new Date()}
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
